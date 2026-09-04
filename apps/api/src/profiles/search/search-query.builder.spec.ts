import { describe, expect, it } from 'vitest';

import { SearchProfilesDto } from '../dto/search-profiles.dto.js';
import {
  buildFacetsQuery,
  buildSearchQuery,
  mapAggregationBuckets,
} from './search-query.builder.js';

describe('buildSearchQuery', () => {
  it('builds a keyword query with conjunctive filters', () => {
    const dto = new SearchProfilesDto();
    dto.q = 'recruiting';
    dto.industry = ['Civil Engineering'];
    dto.jobTitle = ['Recruiting Manager'];
    dto.skills = ['leadership'];
    dto.page = 2;
    dto.limit = 10;

    const query = buildSearchQuery(dto);

    expect(query).toMatchObject({
      from: 10,
      size: 10,
      query: {
        bool: {
          must: [
            {
              multi_match: {
                query: 'recruiting',
                fields: [
                  'fullName^3',
                  'firstName^2',
                  'lastName^2',
                  'summary^2',
                  'skills',
                  'interests',
                  'jobTitle',
                ],
              },
            },
          ],
          filter: [
            { terms: { industry: ['Civil Engineering'] } },
            { terms: { jobTitle: ['Recruiting Manager'] } },
            { terms: { skills: ['leadership'] } },
          ],
        },
      },
    });
  });

  it('adds range filters for experience and salary', () => {
    const dto = new SearchProfilesDto();
    dto.minYearsExperience = 5;
    dto.maxYearsExperience = 20;
    dto.minSalary = 80000;
    dto.maxSalary = 120000;

    const query = buildSearchQuery(dto);

    expect(query.query).toEqual({
      bool: {
        filter: [
          {
            range: {
              inferredYearsExperience: {
                gte: 5,
                lte: 20,
              },
            },
          },
          {
            range: { inferredSalaryMax: { gte: 80000 } },
          },
          {
            range: { inferredSalaryMin: { lte: 120000 } },
          },
        ],
      },
    });
  });
});

describe('buildFacetsQuery', () => {
  it('returns aggregation buckets for all facet fields', () => {
    const query = buildFacetsQuery(new SearchProfilesDto());

    expect(query.size).toBe(0);
    expect(query.aggs).toHaveProperty('industries');
    expect(query.aggs).toHaveProperty('jobTitles');
    expect(query.aggs).toHaveProperty('skills');
  });
});

describe('mapAggregationBuckets', () => {
  it('maps elasticsearch buckets to string arrays', () => {
    const values = mapAggregationBuckets(
      {
        industries: {
          buckets: [{ key: 'Civil Engineering' }, { key: 'Education Management' }],
        },
      },
      'industries',
    );

    expect(values).toEqual(['Civil Engineering', 'Education Management']);
  });
});
