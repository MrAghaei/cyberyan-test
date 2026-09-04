import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';

import { SearchProfilesDto } from './profiles/dto/search-profiles.dto.js';
import {
  ProfileFacetsResponseDto,
  ProfileSearchResponseDto,
} from './profiles/dto/profile-response.dto.js';

export function setupApiDocs(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('LinkedIn Profile Search API')
    .setDescription(
      'Search and filter LinkedIn profiles from the mock dataset using Elasticsearch-backed full-text search and faceted filters.',
    )
    .setVersion('1.0.0')
    .addServer('http://localhost:3000', 'Local development')
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    extraModels: [
      SearchProfilesDto,
      ProfileSearchResponseDto,
      ProfileFacetsResponseDto,
    ],
  });

  for (const pathItem of Object.values(document.paths)) {
    for (const operation of Object.values(pathItem)) {
      if (!operation || typeof operation !== 'object' || !('parameters' in operation)) {
        continue;
      }

      const parameters = operation.parameters;
      if (!Array.isArray(parameters)) {
        continue;
      }

      for (const parameter of parameters) {
        if (
          parameter &&
          typeof parameter === 'object' &&
          'in' in parameter &&
          parameter.in === 'query' &&
          parameter.schema &&
          typeof parameter.schema === 'object'
        ) {
          if (parameter.schema.type === 'array') {
            parameter.style = 'form';
            parameter.explode = true;
          }

          if (
            ['page', 'limit'].includes(String(parameter.name)) &&
            parameter.schema.example !== undefined &&
            parameter.schema.default === undefined
          ) {
            parameter.schema.default = parameter.schema.example;
          }
        }
      }
    }
  }

  SwaggerModule.setup('swagger', app, document, {
    jsonDocumentUrl: '/swagger/json',
  });

  app.use(
    '/docs',
    apiReference({
      theme: 'kepler',
      spec: {
        url: '/swagger/json',
      },
    }),
  );
}
