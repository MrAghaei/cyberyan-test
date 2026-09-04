import type { RawLinkedInRow } from '../types/profile.types.js';
import { toNullableString } from './string-utils.js';

function looksLikeSocialUrl(value: string): boolean {
  return /facebook|linkedin|twitter|instagram|http|\.com|\.net/i.test(value);
}

function looksLikeFacebookUsername(value: string): boolean {
  return /^[a-z0-9._-]+$/i.test(value) && !/^\d+$/.test(value);
}

function looksLikeIndustry(value: string): boolean {
  return /\/|engineering|services|management|legal|health|construction|banking|aviation|aerospace|trucking|transportation|defense|energy|retail|hospitality/i.test(
    value,
  );
}

export function isCorruptedLinkedInRow(row: RawLinkedInRow): boolean {
  const linkedinId = toNullableString(row.linkedin_id);
  if (!linkedinId || !/^\d+$/.test(linkedinId)) {
    return true;
  }

  const facebookUrl = toNullableString(row.facebook_url);
  if (
    facebookUrl &&
    !looksLikeSocialUrl(facebookUrl) &&
    !looksLikeFacebookUsername(facebookUrl)
  ) {
    return true;
  }

  const facebookId = toNullableString(row.facebook_id);
  if (facebookId && !/^\d+$/.test(facebookId) && !looksLikeSocialUrl(facebookId)) {
    return true;
  }

  const companyIndustry = toNullableString(row.job_company_industry);
  if (companyIndustry && /^\d+$/.test(companyIndustry)) {
    return true;
  }

  const locationCountry = toNullableString(row.location_country);
  if (locationCountry && /^\d{4}-\d{2}-\d{2}/.test(locationCountry)) {
    return true;
  }

  const locationRegion = toNullableString(row.location_region);
  if (locationRegion && /^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/.test(locationRegion)) {
    return true;
  }

  return false;
}
