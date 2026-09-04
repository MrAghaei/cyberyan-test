import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProfileDocumentDto {
  @ApiProperty()
  id!: string;

  @ApiPropertyOptional({ nullable: true })
  linkedinId!: string | null;

  @ApiProperty()
  fullName!: string;

  @ApiPropertyOptional({ nullable: true })
  firstName!: string | null;

  @ApiPropertyOptional({ nullable: true })
  lastName!: string | null;

  @ApiPropertyOptional({ nullable: true })
  gender!: string | null;

  @ApiPropertyOptional({ nullable: true })
  industry!: string | null;

  @ApiPropertyOptional({ nullable: true })
  jobTitle!: string | null;

  @ApiPropertyOptional({ nullable: true })
  jobTitleRole!: string | null;

  @ApiPropertyOptional({ nullable: true })
  jobCompanyName!: string | null;

  @ApiPropertyOptional({ nullable: true })
  jobCompanyIndustry!: string | null;

  @ApiPropertyOptional({ nullable: true })
  locationName!: string | null;

  @ApiPropertyOptional({ nullable: true })
  locationCountry!: string | null;

  @ApiPropertyOptional({ nullable: true })
  locationRegion!: string | null;

  @ApiPropertyOptional({ nullable: true })
  summary!: string | null;

  @ApiProperty({ type: [String] })
  skills!: string[];

  @ApiProperty({ type: [String] })
  interests!: string[];

  @ApiPropertyOptional({ nullable: true })
  inferredYearsExperience!: number | null;

  @ApiPropertyOptional({ nullable: true })
  inferredSalaryMin!: number | null;

  @ApiPropertyOptional({ nullable: true })
  inferredSalaryMax!: number | null;
}

export class PaginationMetaDto {
  @ApiProperty()
  total!: number;

  @ApiProperty()
  page!: number;

  @ApiProperty()
  limit!: number;

  @ApiProperty()
  totalPages!: number;
}

export class ProfileSearchResponseDto {
  @ApiProperty({ type: [ProfileDocumentDto] })
  data!: ProfileDocumentDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta!: PaginationMetaDto;
}

export class ProfileFacetsResponseDto {
  @ApiProperty({ type: [String] })
  industries!: string[];

  @ApiProperty({ type: [String] })
  jobTitles!: string[];

  @ApiProperty({ type: [String] })
  jobCompanyNames!: string[];

  @ApiProperty({ type: [String] })
  jobCompanyIndustries!: string[];

  @ApiProperty({ type: [String] })
  locationNames!: string[];

  @ApiProperty({ type: [String] })
  locationCountries!: string[];

  @ApiProperty({ type: [String] })
  locationRegions!: string[];

  @ApiProperty({ type: [String] })
  genders!: string[];

  @ApiProperty({ type: [String] })
  jobTitleRoles!: string[];

  @ApiProperty({ type: [String] })
  skills!: string[];

  @ApiProperty({ type: [String] })
  interests!: string[];
}

export class ApiInfoResponseDto {
  @ApiProperty()
  name!: string;

  @ApiProperty()
  version!: string;

  @ApiProperty({
    example: {
      search: '/profiles/search',
      facets: '/profiles/facets',
      health: '/health',
      swagger: '/swagger',
      docs: '/docs',
    },
  })
  routes!: Record<string, string>;
}

export class HealthResponseDto {
  @ApiProperty({ example: 'ok' })
  status!: string;
}
