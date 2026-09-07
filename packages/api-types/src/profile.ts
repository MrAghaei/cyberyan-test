export interface ProfileDocument {
  id: string;
  linkedinId: string | null;
  fullName: string;
  firstName: string | null;
  lastName: string | null;
  gender: string | null;
  industry: string | null;
  jobTitle: string | null;
  jobTitleRole: string | null;
  jobCompanyName: string | null;
  jobCompanyIndustry: string | null;
  locationName: string | null;
  locationCountry: string | null;
  locationRegion: string | null;
  summary: string | null;
  skills: string[];
  interests: string[];
  inferredYearsExperience: number | null;
  inferredSalaryMin: number | null;
  inferredSalaryMax: number | null;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ProfileSearchResponse {
  data: ProfileDocument[];
  meta: PaginationMeta;
}

export interface ProfileFacetsResponse {
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
}

export interface SearchParams {
  q?: string;
  industry?: string[];
  jobTitle?: string[];
  jobCompanyName?: string[];
  jobCompanyIndustry?: string[];
  locationName?: string[];
  locationCountry?: string[];
  locationRegion?: string[];
  gender?: string[];
  jobTitleRole?: string[];
  skills?: string[];
  interests?: string[];
  minYearsExperience?: number;
  maxYearsExperience?: number;
  minSalary?: number;
  maxSalary?: number;
  page?: number;
  limit?: number;
}
