import { PartialType, OmitType, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateLeadDto } from './create-lead.dto';
import {
  IsString,
  IsOptional,
  IsEmail,
  MaxLength,
  IsBoolean,
} from 'class-validator';

export class UpdateLeadDto extends PartialType(
  OmitType(CreateLeadDto, ['organisationId', 'agentId'] as const),
) {
  @ApiPropertyOptional({
    description: 'Zoho CRM ID for integration',
    example: '5725767000000649013',
    maxLength: 100,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  zohoId?: string;

  @ApiPropertyOptional({
    description: 'Lead owner ID (string)',
    example: 'zoho_5725767000000649013',
  })
  @IsString()
  @IsOptional()
  ownerId?: string;

  @ApiPropertyOptional({
    description: 'First name of the lead',
    example: 'Arjun',
    maxLength: 100,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  firstName?: string;

  @ApiPropertyOptional({
    description: 'Last name of the lead',
    example: 'Sharma',
    maxLength: 100,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  lastName?: string;

  @ApiPropertyOptional({
    description: 'Email address of the lead',
    example: 'arjun.sharma@example.com',
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({
    description: 'Phone number of the lead',
    example: '+919876543210',
    maxLength: 20,
  })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional({
    description: 'Source of the lead (e.g., website, referral, social media)',
    example: 'Instagram',
    maxLength: 100,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  source?: string;

  @ApiPropertyOptional({
    description: 'Current status of the lead',
    example: 'Contacted',
    maxLength: 50,
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  status?: string;

  @ApiPropertyOptional({
    description: 'Disposition or outcome of the lead',
    example: 'Qualified',
    maxLength: 50,
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  disposition?: string;

  @ApiPropertyOptional({
    description: 'Country of the lead',
    example: 'India',
    maxLength: 100,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  country?: string;

  @ApiPropertyOptional({
    description: 'State or province of the lead',
    example: 'Karnataka',
    maxLength: 100,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  state?: string;

  @ApiPropertyOptional({
    description: 'City of the lead',
    example: 'Bangalore',
    maxLength: 100,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  city?: string;

  @ApiPropertyOptional({
    description: 'Reason why the lead is marked as cold',
    example: 'Not interested in the product',
    maxLength: 500,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  reasonForCold?: string;

  @ApiPropertyOptional({
    description: 'Whether the lead has been transferred to another agent or system',
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  isTransferred?: boolean;
}

