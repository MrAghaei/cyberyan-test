import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AppModule } from '../src/app.module.js';
import { normalizeBracketQueryParams } from '../src/common/middleware/normalize-query.middleware.js';
import { ElasticsearchService } from '../src/elasticsearch/elasticsearch.service.js';

describe('Profiles API (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const elasticsearchService = {
      onModuleInit: vi.fn(),
      onModuleDestroy: vi.fn(),
      search: vi.fn().mockResolvedValue({
        hits: [
          {
            id: 'profile-1',
            linkedinId: '47878127',
            fullName: 'Joseph Holland',
            firstName: 'Joseph',
            lastName: 'Holland',
            gender: 'Male',
            industry: 'Civil Engineering',
            jobTitle: 'Recruiting Manager',
            jobTitleRole: 'Human Resources',
            jobCompanyName: 'Garver',
            jobCompanyIndustry: 'Civil Engineering',
            locationName: 'Denton, Texas, United States',
            locationCountry: 'United States',
            locationRegion: 'Texas',
            summary: 'Celebrating its 100th year, Garver is an employee-owned engineering firm.',
            skills: ['recruiting', 'leadership'],
            interests: ['guitar'],
            inferredYearsExperience: 12,
            inferredSalaryMin: 85000,
            inferredSalaryMax: 100000,
          },
        ],
        total: 1,
        aggregations: {
          industries: {
            buckets: [{ key: 'Civil Engineering' }],
          },
          jobTitles: {
            buckets: [{ key: 'Recruiting Manager' }],
          },
        },
      }),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(ElasticsearchService)
      .useValue(elasticsearchService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.use(normalizeBracketQueryParams);
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );
    await app.init();
  });

  it('/profiles/search (GET)', async () => {
    const response = await request(app.getHttpServer())
      .get('/profiles/search')
      .query({ q: 'recruiting', industry: 'Civil Engineering' })
      .expect(200);

    expect(response.body.meta.total).toBe(1);
    expect(response.body.data[0].fullName).toBe('Joseph Holland');
  });

  it('/profiles/facets (GET)', async () => {
    const response = await request(app.getHttpServer())
      .get('/profiles/facets')
      .expect(200);

    expect(response.body.industries).toContain('Civil Engineering');
  });
});
