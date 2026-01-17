import {
    IsString,
    IsOptional,
    IsEmail,
    IsNotEmpty,
    MaxLength,
    IsBoolean,
    IsArray,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsULID } from '../../common/validators/is-ulid.validator';

export class CreateLeadDto {
    @ApiProperty({
        description: 'Organisation ID (ULID format)',
        example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
    })
    @IsString()
    @IsNotEmpty()
    @IsULID()
    organisationId: string;

    @ApiProperty({
        description: 'Agent ID (ULID format)',
        example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
    })
    @IsString()
    @IsNotEmpty()
    @IsULID()
    agentId: string;

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
        example: 'John',
        maxLength: 100,
    })
    @IsString()
    @IsOptional()
    @MaxLength(100)
    firstName?: string;

    @ApiPropertyOptional({
        description: 'Last name of the lead',
        example: 'Doe',
        maxLength: 100,
    })
    @IsString()
    @IsOptional()
    @MaxLength(100)
    lastName?: string;

    @ApiPropertyOptional({
        description: 'Email address of the lead',
        example: 'john.doe@example.com',
    })
    @IsEmail()
    @IsOptional()
    email?: string;

    @ApiPropertyOptional({
        description: 'Phone number of the lead',
        example: '+1234567890',
        maxLength: 20,
    })
    @IsString()
    @IsOptional()
    @MaxLength(20)
    phone?: string;

    @ApiPropertyOptional({
        description:
            'Source of the lead (e.g., website, referral, social media)',
        example: 'Website Contact Form',
        maxLength: 100,
    })
    @IsString()
    @IsOptional()
    @MaxLength(100)
    source?: string;

    @ApiPropertyOptional({
        description: 'Current status of the lead',
        example: 'New',
        maxLength: 50,
    })
    @IsString()
    @IsOptional()
    @MaxLength(50)
    status?: string;

    @ApiPropertyOptional({
        description: 'Disposition or outcome of the lead',
        example: 'Interested',
        maxLength: 50,
    })
    @IsString()
    @IsOptional()
    @MaxLength(50)
    disposition?: string;

    @ApiPropertyOptional({
        description: 'Country of the lead',
        example: 'United States',
        maxLength: 100,
    })
    @IsString()
    @IsOptional()
    @MaxLength(100)
    country?: string;

    @ApiPropertyOptional({
        description: 'State or province of the lead',
        example: 'California',
        maxLength: 100,
    })
    @IsString()
    @IsOptional()
    @MaxLength(100)
    state?: string;

    @ApiPropertyOptional({
        description: 'City of the lead',
        example: 'San Francisco',
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
        description:
            'Whether the lead has been transferred to another agent or system',
        example: false,
        default: false,
    })
    @IsBoolean()
    @IsOptional()
    isTransferred?: boolean;

    @ApiPropertyOptional({
        description:
            'Array of tag IDs to associate with this lead (ULID format)',
        example: ['01HZXYZ1234567890ABCDEFGHJK', '01HZXYZ1234567890ABCDEFGHJL'],
        type: [String],
    })
    @IsArray()
    @IsOptional()
    @IsString({ each: true })
    tagIds?: string[];
}
