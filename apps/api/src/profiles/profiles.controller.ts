import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { SearchProfilesDto } from './dto/search-profiles.dto.js';
import {
  ProfileFacetsResponseDto,
  ProfileSearchResponseDto,
} from './dto/profile-response.dto.js';
import { ProfilesService } from './profiles.service.js';

@ApiTags('profiles')
@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get('search')
  @ApiOperation({
    summary: 'Search profiles (query string)',
    description:
      'Simple GET search. For Scalar and other API clients with many filters, prefer POST /profiles/search.',
  })
  @ApiOkResponse({ type: ProfileSearchResponseDto })
  search(@Query() query: SearchProfilesDto) {
    return this.profilesService.search(query);
  }

  @Post('search')
  @ApiOperation({
    summary: 'Search profiles (JSON body)',
    description:
      'Recommended for Scalar and API clients. Sends all filters reliably in a JSON body instead of query strings.',
  })
  @ApiBody({ type: SearchProfilesDto })
  @ApiOkResponse({ type: ProfileSearchResponseDto })
  searchWithBody(@Body() body: SearchProfilesDto) {
    return this.profilesService.search(body);
  }

  @Get('facets')
  @ApiOperation({
    summary: 'Get facet values',
    description:
      'Returns unique facet values for dropdown filters. Accepts the same filters as search to scope facet counts.',
  })
  @ApiOkResponse({ type: ProfileFacetsResponseDto })
  facets(@Query() query: SearchProfilesDto) {
    return this.profilesService.getFacets(query);
  }

  @Post('facets')
  @ApiOperation({
    summary: 'Get facet values (JSON body)',
    description: 'Same as GET /profiles/facets but accepts filters in the request body.',
  })
  @ApiBody({ type: SearchProfilesDto })
  @ApiOkResponse({ type: ProfileFacetsResponseDto })
  facetsWithBody(@Body() body: SearchProfilesDto) {
    return this.profilesService.getFacets(body);
  }
}
