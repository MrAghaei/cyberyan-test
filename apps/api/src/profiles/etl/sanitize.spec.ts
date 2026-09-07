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
      summary:
        'Celebrating its 100th year, Garver is an employee-owned engineering firm.',
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

  it('rejects numeric ids, phone numbers, and emails', () => {
    expect(toNormalizedLabel('1010966868')).toBeNull();
    expect(toNormalizedLabel('+16304159331')).toBeNull();
    expect(toNormalizedLabel('benjamin_alvarez@andersonsinc.com')).toBeNull();
    expect(toNormalizedLabel('noah.gossard')).toBeNull();
    expect(toNormalizedLabel('linkedin.com/company/uline')).toBeNull();
    expect(toNormalizedLabel('51-200')).toBeNull();
  });

  it('falls back to company industry when personal industry is missing', () => {
    const profile = sanitizeLinkedInRow({
      full_name: 'gary grudowski',
      linkedin_id: '12345000',
      industry: '',
      job_title: 'owner',
      job_company_name: 'grudowski consulting',
      job_company_industry: 'management consulting',
      location_country: 'united states',
      location_region: 'ohio',
    });

    expect(profile?.industry).toBe('Management Consulting');
    expect(profile?.jobTitle).toBe('Owner');
  });
});

describe('summary recovery', () => {
  it('does not store email lists as the profile summary', () => {
    const profile = sanitizeLinkedInRow({
      full_name: 'michelle chador',
      linkedin_id: '54933963',
      industry: 'medical practice',
      job_title: 'registered nurse',
      job_company_name: 'north side hospital and heart institute',
      job_company_industry: 'hospital & health care',
      location_country: 'united states',
      location_region: 'florida',
      summary:
        "[{'address': 'bucfan8474@yahoo.com', 'type': 'personal'}, {'address': 'mchador@largomedical.com', 'type': 'professional'}]",
      location_last_updated:
        'Registered Nurse at North Side Hospital and Heart Institute',
    });

    expect(profile?.summary).toBe(
      'Registered Nurse at North Side Hospital and Heart Institute',
    );
  });

  it('drops dates, phone arrays, and empty python lists from summary', () => {
    const profile = sanitizeLinkedInRow({
      full_name: 'andrew wadsworth',
      linkedin_id: '12345678',
      industry: 'human resources',
      job_title: 'manager',
      location_country: 'united states',
      location_region: 'georgia',
      summary: '2020-11-01',
      phone_numbers: "['+12022858868']",
      interests: '[]',
    });

    expect(profile?.summary).toBeNull();
  });
});
