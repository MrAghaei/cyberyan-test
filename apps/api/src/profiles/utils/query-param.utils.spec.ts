import { describe, expect, it } from 'vitest';

import {
  parseOptionalNumber,
  parseOptionalString,
  parseQueryArray,
  parseQueryLabelArray,
} from './query-param.utils.js';

describe('parseQueryArray', () => {
  it('parses comma-separated values', () => {
    expect(parseQueryArray('Civil Engineering,Education Management')).toEqual([
      'Civil Engineering',
      'Education Management',
    ]);
  });

  it('parses json array strings from api clients', () => {
    expect(parseQueryArray('["Civil Engineering"]')).toEqual([
      'Civil Engineering',
    ]);
  });

  it('keeps commas that belong to a single facet label', () => {
    expect(parseQueryArray('Assistant Chief, Engineering Service')).toEqual([
      'Assistant Chief, Engineering Service',
    ]);
    expect(
      parseQueryArray(['Assistant Chief, Engineering Service']),
    ).toEqual(['Assistant Chief, Engineering Service']);
  });

  it('returns undefined for empty values', () => {
    expect(parseQueryArray('')).toBeUndefined();
    expect(parseQueryArray([])).toBeUndefined();
  });
});

describe('parseQueryLabelArray', () => {
  it('title-cases facet labels', () => {
    expect(parseQueryLabelArray('civil engineering')).toEqual([
      'Civil Engineering',
    ]);
  });
});

describe('parseOptionalNumber', () => {
  it('ignores empty strings from query clients', () => {
    expect(parseOptionalNumber('')).toBeUndefined();
    expect(parseOptionalNumber('20')).toBe(20);
  });
});

describe('parseOptionalString', () => {
  it('ignores empty strings', () => {
    expect(parseOptionalString('')).toBeUndefined();
    expect(parseOptionalString('recruiting')).toBe('recruiting');
  });
});
