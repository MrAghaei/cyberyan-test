import { toTitleCase } from '../../profiles/etl/sanitize.js';

export function parseQueryArray(value: unknown): string[] | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  if (Array.isArray(value)) {
    const items = value.map(String).map((item) => item.trim()).filter(Boolean);
    return items.length > 0 ? items : undefined;
  }

  const normalized = String(value).trim();
  if (!normalized) {
    return undefined;
  }

  if (normalized.startsWith('[')) {
    try {
      const parsed = JSON.parse(normalized.replace(/'/g, '"')) as unknown;
      if (Array.isArray(parsed)) {
        const items = parsed
          .map((item) => (typeof item === 'string' ? item.trim() : ''))
          .filter(Boolean);
        return items.length > 0 ? items : undefined;
      }
    } catch {
      // Fall through to comma-separated parsing.
    }
  }

  const items = normalized
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  return items.length > 0 ? items : undefined;
}

export function parseQueryLabelArray(value: unknown): string[] | undefined {
  const values = parseQueryArray(value);
  return values?.map((item) => toTitleCase(item));
}

export function parseOptionalNumber(value: unknown): number | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function parseOptionalString(value: unknown): string | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  const normalized = String(value).trim();
  return normalized.length > 0 ? normalized : undefined;
}
