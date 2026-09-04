import { Injectable } from '@nestjs/common';
import type { Profile } from '../generated/client.js';
import { ElasticsearchService } from '../elasticsearch/elasticsearch.service.js';
import { SearchProfilesDto } from './dto/search-profiles.dto.js';
import {
  buildFacetsQuery,
  buildSearchQuery,
  mapAggregationBuckets,
} from './search/search-query.builder.js';
import type { ProfileDocument } from './types/profile.types.js';

export type ProfileSearchResult = {
  data: ProfileDocument[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export type ProfileFacetsResult = {
  industries: string[];
  jobTitles: string[];
  jobCompanyNames: string[];
  jobCompanyIndustries: string[];
  locationNames: string[];
  locationCountries: string[];
  locationRegions: string[];
  genders: string[];
  jobTitleRoles: string[];
  skills: string[];
  interests: string[];
};

@Injectable()
export class ProfilesService {
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async search(dto: SearchProfilesDto): Promise<ProfileSearchResult> {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 20;
    const response = await this.elasticsearchService.search<ProfileDocument>(
      buildSearchQuery(dto),
    );

    const totalPages = Math.max(1, Math.ceil(response.total / limit));

    return {
      data: response.hits,
      meta: {
        total: response.total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async getFacets(dto: SearchProfilesDto): Promise<ProfileFacetsResult> {
    const response = await this.elasticsearchService.search(buildFacetsQuery(dto));
    const aggregations = response.aggregations;

    return {
      industries: mapAggregationBuckets(aggregations, 'industries'),
      jobTitles: mapAggregationBuckets(aggregations, 'jobTitles'),
      jobCompanyNames: mapAggregationBuckets(aggregations, 'jobCompanyNames'),
      jobCompanyIndustries: mapAggregationBuckets(
        aggregations,
        'jobCompanyIndustries',
      ),
      locationNames: mapAggregationBuckets(aggregations, 'locationNames'),
      locationCountries: mapAggregationBuckets(aggregations, 'locationCountries'),
      locationRegions: mapAggregationBuckets(aggregations, 'locationRegions'),
      genders: mapAggregationBuckets(aggregations, 'genders'),
      jobTitleRoles: mapAggregationBuckets(aggregations, 'jobTitleRoles'),
      skills: mapAggregationBuckets(aggregations, 'skills'),
      interests: mapAggregationBuckets(aggregations, 'interests'),
    };
  }

  toDocument(profile: Profile): ProfileDocument {
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
      skills: Array.isArray(profile.skills)
        ? (profile.skills as string[])
        : [],
      interests: Array.isArray(profile.interests)
        ? (profile.interests as string[])
        : [],
      inferredYearsExperience: profile.inferredYearsExperience,
      inferredSalaryMin: profile.inferredSalaryMin,
      inferredSalaryMax: profile.inferredSalaryMax,
    };
  }
}
