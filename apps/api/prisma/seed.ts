import 'dotenv/config';
import { resolve } from 'node:path';
import { PrismaPg } from '@prisma/adapter-pg';
import { Client } from '@elastic/elasticsearch';
import { PrismaClient } from '../src/generated/client.js';
import { streamLinkedInProfiles } from '../src/profiles/etl/stream-profiles.js';
import type { SanitizedProfileInput } from '../src/profiles/types/profile.types.js';
import {
  PROFILE_INDEX_MAPPINGS,
  type ProfileDocument,
} from '../src/profiles/types/profile.types.js';

const BATCH_SIZE = 50;

function createPrismaClient(): PrismaClient {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  });

  return new PrismaClient({ adapter });
}

function toProfileDocument(
  profile: Awaited<ReturnType<PrismaClient['profile']['upsert']>>,
): ProfileDocument {
  return {
    id: profile.id,
    linkedinId: profile.linkedinId,
    fullName: profile.fullName,
    firstName: profile.firstName,
    lastName: profile.lastName,
    gender: profile.gender,
    industry: profile.industry,
    jobTitle: profile.jobTitle,
    jobTitleRole: profile.jobTitleRole,
    jobCompanyName: profile.jobCompanyName,
    jobCompanyIndustry: profile.jobCompanyIndustry,
    locationName: profile.locationName,
    locationCountry: profile.locationCountry,
    locationRegion: profile.locationRegion,
    summary: profile.summary,
    skills: Array.isArray(profile.skills) ? (profile.skills as string[]) : [],
    interests: Array.isArray(profile.interests)
      ? (profile.interests as string[])
      : [],
    inferredYearsExperience: profile.inferredYearsExperience,
    inferredSalaryMin: profile.inferredSalaryMin,
    inferredSalaryMax: profile.inferredSalaryMax,
  };
}

async function upsertProfile(
  prisma: PrismaClient,
  input: SanitizedProfileInput,
): Promise<ProfileDocument> {
  const profile = await prisma.profile.upsert({
    where: { linkedinId: input.linkedinId },
    create: {
      linkedinId: input.linkedinId,
      fullName: input.fullName,
      firstName: input.firstName,
      lastName: input.lastName,
      gender: input.gender,
      industry: input.industry,
      jobTitle: input.jobTitle,
      jobTitleRole: input.jobTitleRole,
      jobCompanyName: input.jobCompanyName,
      jobCompanyIndustry: input.jobCompanyIndustry,
      locationName: input.locationName,
      locationCountry: input.locationCountry,
      locationRegion: input.locationRegion,
      summary: input.summary,
      skills: input.skills,
      interests: input.interests,
      inferredYearsExperience: input.inferredYearsExperience,
      inferredSalaryMin: input.inferredSalaryMin,
      inferredSalaryMax: input.inferredSalaryMax,
    },
    update: {
      fullName: input.fullName,
      firstName: input.firstName,
      lastName: input.lastName,
      gender: input.gender,
      industry: input.industry,
      jobTitle: input.jobTitle,
      jobTitleRole: input.jobTitleRole,
      jobCompanyName: input.jobCompanyName,
      jobCompanyIndustry: input.jobCompanyIndustry,
      locationName: input.locationName,
      locationCountry: input.locationCountry,
      locationRegion: input.locationRegion,
      summary: input.summary,
      skills: input.skills,
      interests: input.interests,
      inferredYearsExperience: input.inferredYearsExperience,
      inferredSalaryMin: input.inferredSalaryMin,
      inferredSalaryMax: input.inferredSalaryMax,
    },
  });

  return toProfileDocument(profile);
}

async function ensureElasticsearchIndex(
  client: Client,
  indexName: string,
): Promise<void> {
  const exists = await client.indices.exists({ index: indexName });
  if (!exists) {
    await client.indices.create({
      index: indexName,
      mappings: PROFILE_INDEX_MAPPINGS,
    });
  }
}

async function bulkIndexDocuments(
  client: Client,
  indexName: string,
  documents: ProfileDocument[],
): Promise<void> {
  if (documents.length === 0) {
    return;
  }

  const operations = documents.flatMap((document) => [
    {
      index: {
        _index: indexName,
        _id: document.linkedinId ?? document.id,
      },
    },
    document,
  ]);

  const response = await client.bulk({ refresh: true, operations });
  if (response.errors) {
    throw new Error('Elasticsearch bulk indexing failed during seed');
  }
}

async function processBatch(
  prisma: PrismaClient,
  batch: SanitizedProfileInput[],
): Promise<void> {
  for (const input of batch) {
    await upsertProfile(prisma, input);
  }
}

async function rebuildElasticsearchIndex(
  prisma: PrismaClient,
  client: Client,
  indexName: string,
): Promise<void> {
  await client.indices.delete({ index: indexName, ignore_unavailable: true });
  await ensureElasticsearchIndex(client, indexName);

  let skip = 0;
  while (true) {
    const profiles = await prisma.profile.findMany({
      take: BATCH_SIZE,
      skip,
      orderBy: { linkedinId: 'asc' },
    });

    if (profiles.length === 0) {
      break;
    }

    await bulkIndexDocuments(
      client,
      indexName,
      profiles.map((profile) => toProfileDocument(profile)),
    );
    skip += profiles.length;
  }
}

async function main(): Promise<void> {
  const dataPath = resolve(
    process.cwd(),
    process.env.LINKEDIN_DATA_PATH ?? '../../docs/300 user linkedin.txt',
  );
  const indexName = process.env.ELASTICSEARCH_INDEX ?? 'profiles';
  const elasticsearchNode =
    process.env.ELASTICSEARCH_NODE ?? 'http://localhost:9200';

  const prisma = createPrismaClient();
  const elasticsearch = new Client({ node: elasticsearchNode });

  console.log(`Seeding profiles from ${dataPath}`);

  await ensureElasticsearchIndex(elasticsearch, indexName);

  let batch: SanitizedProfileInput[] = [];
  const processedLinkedinIds = new Set<string>();
  const { processed, skipped } = await streamLinkedInProfiles({
    filePath: dataPath,
    onProfile: async (profile) => {
      processedLinkedinIds.add(profile.linkedinId);
      batch.push(profile);

      if (batch.length >= BATCH_SIZE) {
        const currentBatch = batch;
        batch = [];
        await processBatch(prisma, currentBatch);
      }
    },
  });

  if (batch.length > 0) {
    await processBatch(prisma, batch);
  }

  const removed = await prisma.profile.deleteMany({
    where: {
      linkedinId: {
        notIn: [...processedLinkedinIds],
      },
    },
  });

  await rebuildElasticsearchIndex(prisma, elasticsearch, indexName);

  console.log(
    `Seed complete. Processed: ${processed}, skipped: ${skipped}, removed orphans: ${removed.count}`,
  );

  await prisma.$disconnect();
  await elasticsearch.close();
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
