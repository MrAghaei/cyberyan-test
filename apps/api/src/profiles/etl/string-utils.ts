const EMPTY_VALUES = new Set(['', 'null', 'undefined', 'none', 'nan', '[]', '{}']);

export function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

export function toNullableString(value: string | undefined): string | null {
  if (value === undefined) {
    return null;
  }

  const trimmed = normalizeWhitespace(value);
  if (!trimmed || EMPTY_VALUES.has(trimmed.toLowerCase())) {
    return null;
  }

  return trimmed;
}

const PHONE_OR_ID_PATTERN = /^\+?\d{7,}$/;
const NUMERIC_PATTERN = /^\d+(\.\d+)?$/;
const COMPANY_SIZE_PATTERN = /^\d{1,5}(\+|-\d{1,5}\+?)$/;
const DOTTED_USERNAME_PATTERN = /^[a-z0-9]+(?:[._][a-z0-9]+)+$/i;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}/;
const SALARY_PATTERN = /^\d{1,3}(,\d{3})+(-\d{1,3}(,\d{3})+)?$/;
const GEO_PATTERN = /^-?\d+(\.\d+)?,\s*-?\d+(\.\d+)?$/;
const SOCIAL_PATH_PATTERN =
  /^(linkedin|facebook|twitter|github)\.com\//i;
const STREET_PATTERN =
  /^\d+\s+.+\b(street|st|drive|dr|lane|ln|avenue|ave|road|rd|blvd|boulevard|court|ct|way|ridge|circle|cir|place|pl|highway|hwy|loop)\b/i;

const JOB_TITLE_PATTERN =
  /manager|director|consultant|engineer|specialist|technician|officer|coordinator|analyst|president|owner|nurse|teacher|supervisor|associate|assistant|foreman|planner|producer|realtor|instructor|advisor|administrator|recruiter|captain|sergeant|partner|lead|chief|developer|designer/i;

const INDUSTRY_LABEL_PATTERN =
  /engineering|services|management|legal|health|care|construction|banking|aviation|aerospace|trucking|transportation|defense|energy|retail|hospitality|military|education|estate|security|production|manufacturing|technology|software|media|insurance|government|nonprofit|non-profit|telecom|automotive|research|accounting|logistics|consulting|entertainment|agriculture|farming|wholesale|chemical|oil|gas|electronics|machinery|textile|restaurant|hospital|school|university|real estate|food|utilities|pharmaceutical|biotech|mining|law enforcement|translation|localization/i;

export function looksLikeJobTitle(value: string): boolean {
  return JOB_TITLE_PATTERN.test(value);
}

export function looksLikeIndustryLabel(value: string): boolean {
  return INDUSTRY_LABEL_PATTERN.test(value);
}

export function isImplausibleLabel(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) {
    return true;
  }

  if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
    return true;
  }

  if (
    /@/.test(trimmed) ||
    /https?:\/\//i.test(trimmed) ||
    SOCIAL_PATH_PATTERN.test(trimmed)
  ) {
    return true;
  }

  if (GEO_PATTERN.test(trimmed) || COMPANY_SIZE_PATTERN.test(trimmed)) {
    return true;
  }

  const compact = trimmed.replace(/[\s().-]/g, '');
  if (PHONE_OR_ID_PATTERN.test(compact) || NUMERIC_PATTERN.test(trimmed)) {
    return true;
  }

  return !/\s/.test(trimmed) && DOTTED_USERNAME_PATTERN.test(trimmed);
}

export function isPlausibleSummary(value: string): boolean {
  const trimmed = value.trim();
  if (trimmed.length < 20 || trimmed.length > 4000) {
    return false;
  }

  if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
    return false;
  }

  if (!/[a-zA-Z]/.test(trimmed) || !/\s/.test(trimmed)) {
    return false;
  }

  if (DATE_PATTERN.test(trimmed) || GEO_PATTERN.test(trimmed)) {
    return false;
  }

  if (SALARY_PATTERN.test(trimmed.replace(/\s/g, ''))) {
    return false;
  }

  if (STREET_PATTERN.test(trimmed) && trimmed.length < 80) {
    return false;
  }

  const commaCount = (trimmed.match(/,/g) ?? []).length;
  if (
    commaCount >= 2 &&
    trimmed.length < 80 &&
    /united states|united kingdom|canada/i.test(trimmed)
  ) {
    return false;
  }

  if (/https?:\/\//i.test(trimmed) || /linkedin\.com|facebook\.com/i.test(trimmed)) {
    return false;
  }

  return true;
}

