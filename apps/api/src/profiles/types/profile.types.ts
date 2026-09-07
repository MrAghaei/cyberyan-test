export const PROFILE_INDEX = 'profiles';

export const PROFILE_INDEX_MAPPINGS = {
  properties: {
    id: { type: 'keyword' },
    linkedinId: { type: 'keyword' },
    fullName: {
      type: 'text',
      fields: { keyword: { type: 'keyword' } },
    },
    firstName: { type: 'text' },
    lastName: { type: 'text' },
    gender: { type: 'keyword' },
    industry: { type: 'keyword' },
    jobTitle: {
      type: 'keyword',
      fields: {
        text: { type: 'text' },
      },
    },
    jobTitleRole: { type: 'keyword' },
    jobCompanyName: { type: 'keyword' },
    jobCompanyIndustry: { type: 'keyword' },
    locationName: { type: 'keyword' },
    locationCountry: { type: 'keyword' },
    locationRegion: { type: 'keyword' },
    summary: { type: 'text' },
    skills: { type: 'keyword' },
    interests: { type: 'keyword' },
    inferredYearsExperience: { type: 'float' },
    inferredSalaryMin: { type: 'integer' },
    inferredSalaryMax: { type: 'integer' },
  },
} as const;

export type ProfileDocument = {
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
};

export type RawLinkedInRow = Record<string, string | undefined>;

export type SanitizedProfileInput = {
  linkedinId: string;
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
  skills: string[] | null;
  interests: string[] | null;
  inferredYearsExperience: number | null;
  inferredSalaryMin: number | null;
  inferredSalaryMax: number | null;
};
