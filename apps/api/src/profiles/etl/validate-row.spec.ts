import { describe, expect, it } from 'vitest';

import { sanitizeLinkedInRow } from './sanitize.js';
import { isCorruptedLinkedInRow } from './validate-row.js';

describe('isCorruptedLinkedInRow', () => {
  it('flags rows with shifted columns when facebook_url contains industry text', () => {
    expect(
      isCorruptedLinkedInRow({
        linkedin_id: '408555368',
        facebook_url: 'transportation/trucking/railroad',
        industry: 'accounts',
        job_title: 'sales',
        job_company_industry: '12894125',
        location_country: '2020-12-01',
        location_region: '26.17,-98.05',
      }),
    ).toBe(true);
  });

  it('accepts valid rows', () => {
    expect(
      isCorruptedLinkedInRow({
        linkedin_id: '47878127',
        facebook_url: 'facebook.com/joseph.holand.79',
        facebook_id: '100029324614050',
        industry: 'civil engineering',
        job_title: 'recruiting manager',
        job_company_industry: 'civil engineering',
        location_country: 'united states',
        location_region: 'texas',
      }),
    ).toBe(false);
  });
});

describe('sanitizeLinkedInRow corruption guard', () => {
  it('repairs and imports shifted rows instead of skipping them', () => {
    const profile = sanitizeLinkedInRow({
      full_name: 'abelardo pequeno',
      linkedin_id: '408555368',
      facebook_url: 'transportation/trucking/railroad',
      facebook_username: 'territory manager',
      facebook_id: 'sales',
      industry: 'accounts',
      job_company_industry: '12894125',
      location_country: '2020-12-01',
      location_region: '26.17,-98.05',
    });

    expect(profile).not.toBeNull();
    expect(profile?.industry).toBe('Transportation/Trucking/Railroad');
    expect(profile?.jobTitle).toBe('Territory Manager');
  });
});
