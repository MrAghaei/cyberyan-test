import type { RawLinkedInRow, SanitizedProfileInput } from '../types/profile.types.js';
import { repairLinkedInRow } from './repair-row.js';
import { toNullableString } from './string-utils.js';
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

  if (normalized.startsWith('[') || normalized.startsWith('{')) {
    return null;
  }

  const normalizedValue = normalized.replace(/_/g, ' ');

  return truncateForIndex(toTitleCase(normalizedValue));
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
    industry: toNormalizedLabel(repairedRow.industry),
    jobTitle: toNormalizedLabel(repairedRow.job_title),
    jobTitleRole: toNormalizedLabel(repairedRow.job_title_role),
    jobCompanyName: toNormalizedLabel(repairedRow.job_company_name),
    jobCompanyIndustry: toNormalizedLabel(repairedRow.job_company_industry),
    locationName: toNormalizedLabel(repairedRow.location_name),
    locationCountry: toNormalizedLabel(repairedRow.location_country),
    locationRegion: toNormalizedLabel(repairedRow.location_region),
    summary: toNullableString(repairedRow.summary),
    skills: parseStringArray(repairedRow.skills),
    interests: parseStringArray(repairedRow.interests),
    inferredYearsExperience: parseNumber(repairedRow.inferred_years_experience),
    inferredSalaryMin: salary.min,
    inferredSalaryMax: salary.max,
  };
}
