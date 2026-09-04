import type { SearchProfilesDto } from '../dto/search-profiles.dto.js';

type TermsFilterField =
  | 'industry'
  | 'jobTitle'
  | 'jobCompanyName'
  | 'jobCompanyIndustry'
  | 'locationName'
  | 'locationCountry'
  | 'locationRegion'
  | 'gender'
  | 'jobTitleRole'
  | 'skills'
  | 'interests';

const TERMS_FILTER_FIELDS: TermsFilterField[] = [
  'industry',
  'jobTitle',
  'jobCompanyName',
  'jobCompanyIndustry',
  'locationName',
  'locationCountry',
  'locationRegion',
  'gender',
  'jobTitleRole',
  'skills',
  'interests',
];

export function buildSearchQuery(dto: SearchProfilesDto): Record<string, unknown> {
  const page = dto.page ?? 1;
  const limit = dto.limit ?? 20;
  const from = (page - 1) * limit;

  const filter: Record<string, unknown>[] = [];

  for (const field of TERMS_FILTER_FIELDS) {
    const values = dto[field];
    if (values && values.length > 0) {
      filter.push({ terms: { [field]: values } });
    }
  }

  if (dto.minYearsExperience !== undefined || dto.maxYearsExperience !== undefined) {
    filter.push({
      range: {
        inferredYearsExperience: {
          ...(dto.minYearsExperience !== undefined
            ? { gte: dto.minYearsExperience }
            : {}),
          ...(dto.maxYearsExperience !== undefined
            ? { lte: dto.maxYearsExperience }
            : {}),
        },
      },
    });
  }

  if (dto.minSalary !== undefined || dto.maxSalary !== undefined) {
    const salaryFilter: Record<string, unknown>[] = [];

    if (dto.minSalary !== undefined) {
      salaryFilter.push({
        range: { inferredSalaryMax: { gte: dto.minSalary } },
      });
    }

    if (dto.maxSalary !== undefined) {
      salaryFilter.push({
        range: { inferredSalaryMin: { lte: dto.maxSalary } },
      });
    }

    filter.push(...salaryFilter);
  }

  const must: Record<string, unknown>[] = [];

  if (dto.q?.trim()) {
    must.push({
      multi_match: {
        query: dto.q.trim(),
        fields: ['fullName^3', 'firstName^2', 'lastName^2', 'summary^2', 'skills', 'interests', 'jobTitle'],
        type: 'best_fields',
        fuzziness: 'AUTO',
        operator: 'or',
      },
    });
  }

  const query =
    must.length > 0 || filter.length > 0
      ? {
          bool: {
            ...(must.length > 0 ? { must } : {}),
            ...(filter.length > 0 ? { filter } : {}),
          },
        }
      : { match_all: {} };

  return {
    from,
    size: limit,
    query,
    sort: [{ _score: { order: 'desc' } }, { 'fullName.keyword': { order: 'asc' } }],
  };
}

export function buildFacetsQuery(dto: SearchProfilesDto): Record<string, unknown> {
  const searchBody = buildSearchQuery({ ...dto, page: 1, limit: 0 });

  return {
    ...searchBody,
    size: 0,
    aggs: {
      industries: { terms: { field: 'industry', size: 200 } },
      jobTitles: { terms: { field: 'jobTitle', size: 200 } },
      jobCompanyNames: { terms: { field: 'jobCompanyName', size: 200 } },
      jobCompanyIndustries: {
        terms: { field: 'jobCompanyIndustry', size: 200 },
      },
      locationNames: { terms: { field: 'locationName', size: 200 } },
      locationCountries: { terms: { field: 'locationCountry', size: 200 } },
      locationRegions: { terms: { field: 'locationRegion', size: 200 } },
      genders: { terms: { field: 'gender', size: 20 } },
      jobTitleRoles: { terms: { field: 'jobTitleRole', size: 100 } },
      skills: { terms: { field: 'skills', size: 100 } },
      interests: { terms: { field: 'interests', size: 100 } },
    },
  };
}

export function mapAggregationBuckets(
  aggregations: Record<string, unknown> | undefined,
  key: string,
): string[] {
  const aggregation = aggregations?.[key] as
    | { buckets?: Array<{ key: string }> }
    | undefined;

  return (
    aggregation?.buckets
      ?.map((bucket) => bucket.key)
      .filter((value) => Boolean(value)) ?? []
  );
}
