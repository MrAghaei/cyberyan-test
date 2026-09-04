import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import {
  ApiInfoResponseDto,
  HealthResponseDto,
} from './profiles/dto/profile-response.dto.js';

@ApiTags('system')
@Controller()
export class AppController {
  @Get()
  @ApiOperation({ summary: 'API entrypoint with route links' })
  @ApiOkResponse({ type: ApiInfoResponseDto })
  getRoot(): ApiInfoResponseDto {
    return {
      name: 'LinkedIn Profile Search API',
      version: '1.0.0',
      routes: {
        search: '/profiles/search',
        facets: '/profiles/facets',
        health: '/health',
        swagger: '/swagger',
        docs: '/docs',
      },
    };
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check' })
  @ApiOkResponse({ type: HealthResponseDto })
  getHealth(): HealthResponseDto {
    return { status: 'ok' };
  }
}
