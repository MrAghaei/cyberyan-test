const EMPTY_VALUES = new Set(['', 'null', 'undefined', 'none', 'nan']);

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
