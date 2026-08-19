import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RecommendFreelancersDto {
  @ApiProperty({ description: 'Target project ID or prompt description' })
  @IsString()
  @IsNotEmpty()
  projectId: string;

  @ApiProperty({ description: 'Limit number of recommendations', default: 5, required: false })
  @IsOptional()
  @IsNumber()
  limit?: number;
}

export class RecommendProjectsDto {
  @ApiProperty({ description: 'Target freelancer user ID' })
  @IsString()
  @IsNotEmpty()
  freelancerUserId: string;

  @ApiProperty({ description: 'Limit number of recommendations', default: 5, required: false })
  @IsOptional()
  @IsNumber()
  limit?: number;
}

export class RecommendationFeedbackDto {
  @ApiProperty({ description: 'Target entity ID (freelancer user ID or project ID)' })
  @IsString()
  @IsNotEmpty()
  targetId: string;

  @ApiProperty({ description: 'FREELANCER or PROJECT' })
  @IsString()
  @IsNotEmpty()
  recommendationType: 'FREELANCER' | 'PROJECT';

  @ApiProperty({ description: 'Action taken', example: 'CLICKED' })
  @IsString()
  @IsNotEmpty()
  action: 'SHOWN' | 'CLICKED' | 'DISMISSED' | 'APPLIED' | 'HIRED';
}

export class UpdateWeightsDto {
  @ApiProperty({ example: 0.35 })
  @IsNumber()
  @Min(0)
  @Max(1)
  skillWeight: number;

  @ApiProperty({ example: 0.20 })
  @IsNumber()
  @Min(0)
  @Max(1)
  semanticWeight: number;

  @ApiProperty({ example: 0.15 })
  @IsNumber()
  @Min(0)
  @Max(1)
  reputationWeight: number;

  @ApiProperty({ example: 0.15 })
  @IsNumber()
  @Min(0)
  @Max(1)
  budgetWeight: number;

  @ApiProperty({ example: 0.10 })
  @IsNumber()
  @Min(0)
  @Max(1)
  freshnessWeight: number;

  @ApiProperty({ example: 0.05 })
  @IsNumber()
  @Min(0)
  @Max(1)
  coldStartWeight: number;
}
