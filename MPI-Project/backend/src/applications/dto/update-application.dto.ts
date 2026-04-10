import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { ApplicationStatus } from '@prisma/client';

export class UpdateApplicationDto {
  @IsUUID()
  userId: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  companyName?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  roleTitle?: string;

  @IsOptional()
  @IsEnum(ApplicationStatus)
  status?: ApplicationStatus;

  @IsOptional()
  @IsDateString()
  appliedAt?: string;
}