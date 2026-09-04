import type { RawLinkedInRow } from '../types/profile.types.js';
import { toNullableString } from './string-utils.js';
import { isCorruptedLinkedInRow } from './validate-row.js';

export const LINKEDIN_CSV_COLUMNS = [
  'full_name',
  'first_name',
  'last_name',
  'gender',
  'linkedin_url',
  'linkedin_username',
  'linkedin_id',
  'facebook_url',
  'facebook_username',
  'facebook_id',
  'industry',
  'job_title',
  'job_title_role',
  'job_title_levels',
  'job_company_id',
  'job_company_name',
  'job_company_website',
  'job_company_size',
  'job_company_founded',
  'job_company_industry',
  'job_company_linkedin_url',
  'job_company_linkedin_id',
  'job_company_facebook_url',
  'job_company_twitter_url',
  'job_company_location_name',
  'job_company_location_locality',
  'job_company_location_metro',
  'job_company_location_region',
  'job_company_location_geo',
  'job_company_location_country',
  'job_company_location_continent',
  'job_last_updated',
  'job_start_date',
  'location_name',
  'location_locality',
  'location_metro',
  'location_region',
  'location_country',
  'location_continent',
  'location_geo',
  'location_last_updated',
  'linkedin_connections',
  'inferred_salary',
  'inferred_years_experience',
  'summary',
  'phone_numbers',
  'emails',
  'interests',
  'skills',
  'location_names',
  'regions',
  'countries',
  'street_addresses',
  'experience',
  'education',
  'profiles',
  'certifications',
  'languages',
  'version_status',
  'work_email',
  'job_company_location_street_address',
  'job_company_location_postal_code',
  'job_summary',
  'location_street_address',
  'location_postal_code',
  'middle_initial',
  'middle_name',
  'birth_year',
  'birth_date',
  'twitter_url',
  'twitter_username',
  'github_url',
  'github_username',
  'mobile_phone',
  'location_address_line_2',
  'job_title_sub_role',
  'job_company_location_address_line_2',
] as const;

const LINKEDIN_ID_INDEX = LINKEDIN_CSV_COLUMNS.indexOf('linkedin_id');

function rowToOrderedValues(row: RawLinkedInRow): string[] {
  return LINKEDIN_CSV_COLUMNS.map((column) => row[column] ?? '');
}

function orderedValuesToRow(values: string[]): RawLinkedInRow {
  return Object.fromEntries(
    LINKEDIN_CSV_COLUMNS.map((column, index) => [column, values[index] ?? '']),
  );
}

function shiftRowAfterLinkedInId(
  values: string[],
  shiftAmount: number,
): string[] {
  if (shiftAmount <= 0) {
    return values;
  }

  const before = values.slice(0, LINKEDIN_ID_INDEX + 1);
  const middle = values.slice(
    LINKEDIN_ID_INDEX + 1,
    Math.max(LINKEDIN_ID_INDEX + 1, values.length - shiftAmount),
  );

  return [
    ...before,
    ...Array.from({ length: shiftAmount }, () => ''),
    ...middle,
  ].slice(0, LINKEDIN_CSV_COLUMNS.length);
}

function isPlausibleRepairedRow(row: RawLinkedInRow): boolean {
  if (isCorruptedLinkedInRow(row)) {
    return false;
  }

  const industry = toNullableString(row.industry);
  if (industry && /^\d+$/.test(industry)) {
    return false;
  }

  const jobTitle = toNullableString(row.job_title);
  if (!industry && !jobTitle) {
    return false;
  }

  return true;
}

export function repairLinkedInRow(row: RawLinkedInRow): RawLinkedInRow {
  if (!isCorruptedLinkedInRow(row)) {
    return row;
  }

  const facebookUrl = toNullableString(row.facebook_url);
  const facebookId = toNullableString(row.facebook_id);
  if (facebookUrl && /^\d+$/.test(facebookUrl) && facebookId && !/^\d+$/.test(facebookId)) {
    const repairedRow = {
      ...row,
      facebook_url: '',
      facebook_username: row.facebook_username ?? '',
      facebook_id: facebookUrl,
      industry: facebookId,
      job_title: row.industry,
    };

    if (isPlausibleRepairedRow(repairedRow)) {
      return repairedRow;
    }
  }

  const values = rowToOrderedValues(row);

  for (const shiftAmount of [3, 2, 1]) {
    const repairedValues = shiftRowAfterLinkedInId(values, shiftAmount);
    const repairedRow = orderedValuesToRow(repairedValues);

    if (isPlausibleRepairedRow(repairedRow)) {
      return repairedRow;
    }
  }

  return row;
}
