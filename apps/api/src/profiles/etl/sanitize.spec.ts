import { describe, expect, it } from 'vitest';

import {
  parseSalaryRange,
  parseStringArray,
  sanitizeLinkedInRow,
  toNormalizedLabel,
} from './sanitize.js';
import mockProfiles from '../../test/fixtures/mock-profiles.json';

describe('sanitizeLinkedInRow', () => {
  it('normalizes labels and parses python-style arrays', () => {
    const profile = sanitizeLinkedInRow(mockProfiles[0]);

    expect(profile).toMatchObject({
      linkedinId: '47878127',
      fullName: 'Joseph Holland',
      industry: 'Civil Engineering',
      jobTitle: 'Recruiting Manager',
      skills: ['recruiting', 'leadership', 'human resources'],
      interests: ['guitar', 'aviation', 'politics'],
      inferredYearsExperience: 12,
      inferredSalaryMin: 85000,
      inferredSalaryMax: 100000,
    });
  });

  it('handles empty skills arrays as null', () => {
    const profile = sanitizeLinkedInRow(mockProfiles[1]);

    expect(profile?.skills).toBeNull();
    expect(profile?.interests).toEqual(['casinos', 'exercise', 'fishing']);
  });

  it('returns null for rows missing required identifiers', () => {
    expect(sanitizeLinkedInRow(mockProfiles[3])).toBeNull();
  });
});

describe('parseStringArray', () => {
  it('converts python-style lists to string arrays', () => {
    expect(parseStringArray("['manager', 'director']")).toEqual([
      'manager',
      'director',
    ]);
  });
});

describe('parseSalaryRange', () => {
  it('parses comma-separated salary ranges', () => {
    expect(parseSalaryRange('85,000-100,000')).toEqual({
      min: 85000,
      max: 100000,
    });
  });
});

describe('toNormalizedLabel', () => {
  it('title-cases industry values for consistent facets', () => {
    expect(toNormalizedLabel('civil engineering')).toBe('Civil Engineering');
  });
});
