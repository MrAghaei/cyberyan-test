import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

import {
  parseOptionalNumber,
  parseOptionalString,
  parseQueryArray,
  parseQueryLabelArray,
} from '../utils/query-param.utils.js';

export class SearchProfilesDto {
  @ApiPropertyOptional({
    description:
      'Keyword search across name, summary, skills, interests, and job title',
    example: 'recruiting',
  })
  @IsOptional()
  @Transform(({ value }) => parseOptionalString(value))
  @IsString()
  q?: string;

  @ApiPropertyOptional({
    type: [String],
    example: ['Civil Engineering'],
    description: 'Exact match. Use Title Case values from /profiles/facets.',
  })
  @IsOptional()
  @Transform(({ value }) => parseQueryLabelArray(value))
  @IsArray()
  @IsString({ each: true })
  industry?: string[];

  @ApiPropertyOptional({
    type: [String],
    example: ['Recruiting Manager'],
  })
  @IsOptional()
  @Transform(({ value }) => parseQueryLabelArray(value))
  @IsArray()
  @IsString({ each: true })
  jobTitle?: string[];

  @ApiPropertyOptional({ type: [String], example: ['Garver'] })
  @IsOptional()
  @Transform(({ value }) => parseQueryLabelArray(value))
  @IsArray()
  @IsString({ each: true })
  jobCompanyName?: string[];

  @ApiPropertyOptional({ type: [String], example: ['Civil Engineering'] })
  @IsOptional()
  @Transform(({ value }) => parseQueryLabelArray(value))
  @IsArray()
  @IsString({ each: true })
  jobCompanyIndustry?: string[];

  @ApiPropertyOptional({
    type: [String],
    example: ['Denton, Texas, United States'],
  })
  @IsOptional()
  @Transform(({ value }) => parseQueryLabelArray(value))
  @IsArray()
  @IsString({ each: true })
  locationName?: string[];

  @ApiPropertyOptional({ type: [String], example: ['United States'] })
  @IsOptional()
  @Transform(({ value }) => parseQueryLabelArray(value))
  @IsArray()
  @IsString({ each: true })
  locationCountry?: string[];

  @ApiPropertyOptional({ type: [String], example: ['Texas'] })
  @IsOptional()
  @Transform(({ value }) => parseQueryLabelArray(value))
  @IsArray()
  @IsString({ each: true })
  locationRegion?: string[];

  @ApiPropertyOptional({ type: [String], example: ['Male'] })
  @IsOptional()
  @Transform(({ value }) => parseQueryLabelArray(value))
  @IsArray()
  @IsString({ each: true })
  gender?: string[];

  @ApiPropertyOptional({ type: [String], example: ['Human_resources'] })
  @IsOptional()
  @Transform(({ value }) => parseQueryLabelArray(value))
  @IsArray()
  @IsString({ each: true })
  jobTitleRole?: string[];

  @ApiPropertyOptional({ type: [String], example: ['leadership'] })
  @IsOptional()
  @Transform(({ value }) => parseQueryArray(value))
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  @ApiPropertyOptional({ type: [String], example: ['travel'] })
  @IsOptional()
  @Transform(({ value }) => parseQueryArray(value))
  @IsArray()
  @IsString({ each: true })
  interests?: string[];

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @Transform(({ value }) => parseOptionalNumber(value))
  @IsNumber()
  minYearsExperience?: number;

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @Transform(({ value }) => parseOptionalNumber(value))
  @IsNumber()
  maxYearsExperience?: number;

  @ApiPropertyOptional({ example: 80000 })
  @IsOptional()
  @Transform(({ value }) => parseOptionalNumber(value))
  @IsInt()
  minSalary?: number;

  @ApiPropertyOptional({ example: 120000 })
  @IsOptional()
  @Transform(({ value }) => parseOptionalNumber(value))
  @IsInt()
  maxSalary?: number;

  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  @Transform(({ value }) => parseOptionalNumber(value) ?? 1)
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ example: 20, default: 20 })
  @IsOptional()
  @Transform(({ value }) => parseOptionalNumber(value) ?? 20)
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
