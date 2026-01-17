import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsULID } from '../../common/validators/is-ulid.validator';

export class CreateTagDto {
    @ApiProperty({
        description: 'Tag name',
        example: 'High Priority',
        maxLength: 100,
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    name: string;

    @ApiProperty({
        description: 'URL-friendly slug for the tag',
        example: 'high-priority',
        maxLength: 100,
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    slug: string;

    @ApiProperty({
        description: 'Organisation ID (ULID format)',
        example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
    })
    @IsString()
    @IsNotEmpty()
    @IsULID()
    organisationId: string;
}
