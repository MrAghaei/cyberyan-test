import { describe, expect, it } from 'vitest';

import { repairLinkedInRow } from './repair-row.js';
import { sanitizeLinkedInRow } from './sanitize.js';
import { isCorruptedLinkedInRow } from './validate-row.js';

describe('repairLinkedInRow', () => {
  it('realigns rows missing empty facebook columns', () => {
    const row = {
      linkedin_id: '408555368',
      facebook_url: 'transportation/trucking/railroad',
      facebook_username: 'territory manager',
      facebook_id: 'sales',
      industry: 'accounts',
      job_company_industry: '12894125',
      location_country: '2020-12-01',
      location_region: '26.17,-98.05',
    };

    const repaired = repairLinkedInRow(row);
    expect(isCorruptedLinkedInRow(repaired)).toBe(false);
    expect(repaired.industry).toBe('transportation/trucking/railroad');
    expect(repaired.job_title).toBe('territory manager');
    expect(repaired.facebook_url).toBe('');
  });

  it('realigns rows with facebook id shifted into facebook_url', () => {
    const row = {
      linkedin_id: '44136770',
      facebook_url: '646818035',
      facebook_username: '',
      facebook_id: 'civil engineering',
      industry: 'assistant chief, engineering service',
      location_country: 'united states',
      location_region: 'texas',
    };

    const repaired = repairLinkedInRow(row);
    expect(isCorruptedLinkedInRow(repaired)).toBe(false);
    expect(repaired.facebook_id).toBe('646818035');
    expect(repaired.industry).toBe('civil engineering');
  });
});

describe('sanitizeLinkedInRow after repair', () => {
  it('imports repaired Adam Lynch profile', () => {
    const profile = sanitizeLinkedInRow({
      full_name: 'adam lynch',
      linkedin_id: '28947010',
      facebook_url: 'aviation & aerospace',
      facebook_username: 'test technician',
      industry: '',
      job_company_name: 'lockheed martin',
      job_company_industry: 'defense & space',
      location_country: 'united states',
      location_region: 'colorado',
    });

    expect(profile).not.toBeNull();
    expect(profile?.fullName).toBe('Adam Lynch');
    expect(profile?.industry).toBe('Aviation & Aerospace');
    expect(profile?.jobTitle).toBe('Test Technician');
  });
});
