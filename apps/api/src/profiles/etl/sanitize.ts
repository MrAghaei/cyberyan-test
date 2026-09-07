import type { RawLinkedInRow, SanitizedProfileInput } from '../types/profile.types.js';
import { repairLinkedInRow } from './repair-row.js';
import {
  isImplausibleLabel,
  isPlausibleSummary,
  looksLikeIndustryLabel,
  toNullableString,
} from './string-utils.js';
import { isCorruptedLinkedInRow } from './validate-row.js';

const MAX_INDEXED_LABEL_LENGTH = 255;

export function truncateForIndex(
  value: string,
  maxLength = MAX_INDEXED_LABEL_LENGTH,
): string {
  if (value.length <= maxLength) {
    return value;
  }

  return value.slice(0, maxLength).trim();
}

export function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

export { toNullableString } from './string-utils.js';

export function toTitleCase(value: string): string {
  return value
    .toLowerCase()
    .split(/(\s+|\/|&)/)
    .map((part) => {
      if (part === '/' || part === '&' || /^\s+$/.test(part)) {
        return part;
      }

      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join('');
}

export function toNormalizedLabel(value: string | undefined): string | null {
  const normalized = toNullableString(value);
  if (!normalized) {
    return null;
  }

  if (isImplausibleLabel(normalized)) {
    return null;
  }

  const normalizedValue = normalized.replace(/_/g, ' ');

  return truncateForIndex(toTitleCase(normalizedValue));
}

export function pickIndustry(
  personalIndustry: string | undefined,
  companyIndustry: string | undefined,
): string | null {
  const personal = toNormalizedLabel(personalIndustry);
  if (personal) {
    return personal;
  }

  const company = toNormalizedLabel(companyIndustry);
  if (company && looksLikeIndustryLabel(company)) {
    return company;
  }

  return null;
}

export function parsePythonLikeJson<T>(value: string | undefined): T | null {
  const normalized = toNullableString(value);
  if (!normalized || normalized === '[]') {
    return null;
  }

  try {
    const jsonish = normalized
      .replace(/\bNone\b/g, 'null')
      .replace(/\bTrue\b/g, 'true')
      .replace(/\bFalse\b/g, 'false')
      .replace(/'/g, '"');

    const parsed = JSON.parse(jsonish) as T;
    return parsed;
  } catch {
    return null;
  }
}

export function parseStringArray(value: string | undefined): string[] | null {
  const parsed = parsePythonLikeJson<unknown>(value);
  if (!Array.isArray(parsed)) {
    return null;
  }

  const items = parsed
    .map((item) => (typeof item === 'string' ? normalizeWhitespace(item) : null))
    .filter((item): item is string => Boolean(item));

  return items.length > 0 ? items : null;
}

export function parseNumber(value: string | undefined): number | null {
  const normalized = toNullableString(value);
  if (!normalized) {
    return null;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

export function parseSalaryRange(
  value: string | undefined,
): { min: number | null; max: number | null } {
  const normalized = toNullableString(value);
  if (!normalized) {
    return { min: null, max: null };
  }

  const [minPart, maxPart] = normalized.split('-').map((part) => part.replace(/,/g, '').trim());
  const min = minPart ? Number(minPart) : null;
  const max = maxPart ? Number(maxPart) : null;

  return {
    min: Number.isFinite(min) ? min : null,
    max: Number.isFinite(max) ? max : null,
  };
}

const SUMMARY_SKIP_FIELDS = new Set([
  'full_name',
  'first_name',
  'last_name',
  'middle_name',
  'middle_initial',
  'gender',
  'linkedin_url',
  'linkedin_username',
  'linkedin_id',
  'facebook_url',
  'facebook_username',
  'facebook_id',
  'twitter_url',
  'twitter_username',
  'github_url',
  'github_username',
  'industry',
  'job_title',
  'job_title_role',
  'job_title_sub_role',
  'job_company_name',
  'job_company_website',
  'job_company_id',
  'work_email',
  'mobile_phone',
]);

function collectSummaryCandidates(row: RawLinkedInRow, skipValues: Set<string>): string[] {
  const candidates: string[] = [];

  for (const [field, rawValue] of Object.entries(row)) {
    if (SUMMARY_SKIP_FIELDS.has(field)) {
      continue;
    }

    const value = toNullableString(rawValue);
    if (!value || skipValues.has(value.toLowerCase()) || !isPlausibleSummary(value)) {
      continue;
    }

    candidates.push(value);
  }

  return candidates;
}

export function pickSummary(
  repairedRow: RawLinkedInRow,
  originalRow: RawLinkedInRow,
): string | null {
  const skipValues = new Set(
    [
      repairedRow.industry,
      repairedRow.job_title,
      repairedRow.job_company_name,
      originalRow.industry,
      originalRow.job_title,
      originalRow.job_company_name,
    ]
      .map((value) => toNullableString(value)?.toLowerCase())
      .filter((value): value is string => Boolean(value)),
  );

  const preferred = [
    repairedRow.summary,
    repairedRow.job_summary,
    originalRow.summary,
    originalRow.job_summary,
  ];

  for (const candidate of preferred) {
    const value = toNullableString(candidate);
    if (value && !skipValues.has(value.toLowerCase()) && isPlausibleSummary(value)) {
      return value;
    }
  }

  const recovered = [
    ...collectSummaryCandidates(repairedRow, skipValues),
    ...collectSummaryCandidates(originalRow, skipValues),
  ];

  if (recovered.length === 0) {
    return null;
  }

  return [...new Set(recovered)].sort((left, right) => right.length - left.length)[0] ?? null;
}

export function sanitizeLinkedInRow(row: RawLinkedInRow): SanitizedProfileInput | null {
  const repairedRow = repairLinkedInRow(row);

  if (isCorruptedLinkedInRow(repairedRow)) {
    return null;
  }

  const linkedinId = toNullableString(repairedRow.linkedin_id);
  const fullName = toNullableString(repairedRow.full_name);

  if (!linkedinId || !fullName) {
    return null;
  }

  const salary = parseSalaryRange(repairedRow.inferred_salary);

  return {
    linkedinId: truncateForIndex(linkedinId, 64),
    fullName: truncateForIndex(toTitleCase(fullName), 255),
    firstName: toNormalizedLabel(repairedRow.first_name),
    lastName: toNormalizedLabel(repairedRow.last_name),
    gender: toNormalizedLabel(repairedRow.gender),
    industry: pickIndustry(
      repairedRow.industry,
      repairedRow.job_company_industry,
    ),
    jobTitle: toNormalizedLabel(repairedRow.job_title),
    jobTitleRole: toNormalizedLabel(repairedRow.job_title_role),
    jobCompanyName: toNormalizedLabel(repairedRow.job_company_name),
    jobCompanyIndustry: toNormalizedLabel(repairedRow.job_company_industry),
    locationName: toNormalizedLabel(repairedRow.location_name),
    locationCountry: toNormalizedLabel(repairedRow.location_country),
    locationRegion: toNormalizedLabel(repairedRow.location_region),
    summary: pickSummary(repairedRow, row),
    skills: parseStringArray(repairedRow.skills),
    interests: parseStringArray(repairedRow.interests),
    inferredYearsExperience: parseNumber(repairedRow.inferred_years_experience),
    inferredSalaryMin: salary.min,
    inferredSalaryMax: salary.max,
  };
}
