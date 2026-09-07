import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from '@elastic/elasticsearch';

import {
  PROFILE_INDEX_MAPPINGS,
  type ProfileDocument,
} from '../profiles/types/profile.types.js';

@Injectable()
export class ElasticsearchService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ElasticsearchService.name);
  private readonly client: Client;
  private readonly indexName: string;

  constructor(private readonly configService: ConfigService) {
    this.indexName = this.configService.getOrThrow<string>('ELASTICSEARCH_INDEX');
    this.client = new Client({
      node: this.configService.getOrThrow<string>('ELASTICSEARCH_NODE'),
    });
  }

  get index(): string {
    return this.indexName;
  }

  async onModuleInit(): Promise<void> {
    await this.ensureIndex();
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.close();
  }

  async ensureIndex(): Promise<void> {
    const exists = await this.client.indices.exists({ index: this.indexName });
    if (!exists) {
      await this.client.indices.create({
        index: this.indexName,
        mappings: PROFILE_INDEX_MAPPINGS,
      });
      this.logger.log(`Created Elasticsearch index "${this.indexName}"`);
      return;
    }

    await this.client.indices.putMapping({
      index: this.indexName,
      properties: PROFILE_INDEX_MAPPINGS.properties,
    });
  }

  async bulkIndex(documents: ProfileDocument[]): Promise<void> {
    if (documents.length === 0) {
      return;
    }

    const operations = documents.flatMap((document) => [
      {
        index: {
          _index: this.indexName,
          _id: document.linkedinId ?? document.id,
        },
      },
      document,
    ]);

    const response = await this.client.bulk({
      refresh: true,
      operations,
    });

    if (response.errors) {
      const failedItems = response.items?.filter((item) => item.index?.error);
      throw new Error(
        `Elasticsearch bulk index failed: ${JSON.stringify(failedItems?.slice(0, 3))}`,
      );
    }
  }

  async search<TDocument extends ProfileDocument = ProfileDocument>(
    body: Record<string, unknown>,
  ): Promise<{
    hits: TDocument[];
    total: number;
    aggregations?: Record<string, unknown>;
  }> {
    const response = await this.client.search<ProfileDocument>({
      index: this.indexName,
      ...body,
    });

    const total =
      typeof response.hits.total === 'number'
        ? response.hits.total
        : (response.hits.total?.value ?? 0);

    const hits = response.hits.hits
      .map((hit) => hit._source)
      .filter((source): source is ProfileDocument => Boolean(source)) as TDocument[];

    return {
      hits,
      total,
      aggregations: response.aggregations as Record<string, unknown> | undefined,
    };
  }
}
