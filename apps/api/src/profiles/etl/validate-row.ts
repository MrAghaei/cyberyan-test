import type { RawLinkedInRow } from '../types/profile.types.js';
import {
  isImplausibleLabel,
  looksLikeIndustryLabel,
  looksLikeJobTitle,
  toNullableString,
} from './string-utils.js';

function looksLikeSocialUrl(value: string): boolean {
  return /facebook|linkedin|twitter|instagram|http|\.com|\.net/i.test(value);
}

function looksLikeFacebookUsername(value: string): boolean {
  return /^[a-z0-9._-]+$/i.test(value) && !/^\d+$/.test(value);
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

  const industry = toNullableString(row.industry);
  if (industry && isImplausibleLabel(industry)) {
    return true;
  }

  const jobTitle = toNullableString(row.job_title);
  if (jobTitle && isImplausibleLabel(jobTitle)) {
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
