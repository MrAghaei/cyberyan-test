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

  it('drops extra phone numbers inserted before industry', () => {
    const row = {
      linkedin_id: '252622168',
      facebook_url: '',
      facebook_username: '',
      facebook_id: '100000672532843',
      industry: '+12102597826',
      job_title: 'hospital & health care',
      job_title_role: 'infectious disease consultant',
      job_company_name: 'telemed2u',
      job_company_founded: 'hospital & health care',
      job_company_industry: '2011',
      location_country: 'united states',
      location_region: 'oregon',
    };

    const repaired = repairLinkedInRow(row);
    expect(isCorruptedLinkedInRow(repaired)).toBe(false);
    expect(repaired.industry).toBe('hospital & health care');
    expect(repaired.job_title).toBe('infectious disease consultant');
  });

  it('does not move facebook ids into job title when industry is empty', () => {
    const row = {
      linkedin_id: '230583407',
      facebook_url: 'facebook.com/angelo.prestigiacomo.7',
      facebook_username: 'angelo.prestigiacomo.7',
      facebook_id: '1010966868',
      industry: '',
      job_title: 'real estate',
      job_title_role: 'partner and owner',
      job_title_levels: "['owner']",
      job_company_id: 'bluearrow-realestate',
      job_company_name: 'blue arrow real estate',
      job_company_website: 'b-arrow.com',
      job_company_size: '11-50',
      job_company_founded: '2017',
      job_company_industry: '2017',
      location_country: 'united states',
      location_region: 'new york',
    };

    const repaired = repairLinkedInRow(row);
    expect(isCorruptedLinkedInRow(repaired)).toBe(false);
    expect(repaired.industry).toBe('real estate');
    expect(repaired.job_title).toBe('partner and owner');
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

  it('drops extra phone numbers sitting in the industry column', () => {
    const row = {
      linkedin_id: '392124648',
      facebook_url: 'facebook.com/levi.hale',
      facebook_username: 'levi.hale',
      facebook_id: '689067399',
      industry: '+15805831639',
      job_title: 'automotive',
      job_title_role: 'automotive technician',
      job_company_industry: 'automotive',
      location_country: 'united states',
      location_region: 'oklahoma',
    };

    const repaired = repairLinkedInRow(row);
    expect(isCorruptedLinkedInRow(repaired)).toBe(false);
    expect(repaired.industry).toBe('automotive');
    expect(repaired.job_title).toBe('automotive technician');
  });

  it('recovers industry when it was stored in job_title', () => {
    const row = {
      linkedin_id: '9074692',
      facebook_url: 'facebook.com/keith.dienelt',
      facebook_username: 'keith.dienelt',
      facebook_id: '100000117414040',
      industry: '',
      job_title: 'military',
      job_title_role: 'business owner',
      job_company_name: 'stillhouse sweeping',
      location_country: 'united states',
      location_region: 'texas',
    };

    const repaired = repairLinkedInRow(row);
    expect(isCorruptedLinkedInRow(repaired)).toBe(false);
    expect(repaired.industry).toBe('military');
    expect(repaired.job_title).toBe('business owner');
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
