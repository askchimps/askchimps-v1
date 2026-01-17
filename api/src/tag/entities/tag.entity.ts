import { ApiProperty } from '@nestjs/swagger';

export class TagEntity {
    @ApiProperty({
        description: 'Tag ID (ULID format)',
        example: '01HZXYZ1234567890ABCDEFGHJK',
    })
    id: string;

    @ApiProperty({
        description: 'Tag name',
        example: 'High Priority',
    })
    name: string;

    @ApiProperty({
        description: 'URL-friendly slug',
        example: 'high-priority',
    })
    slug: string;

    @ApiProperty({
        description: 'Organisation ID (ULID format)',
        example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
    })
    organisationId: string;

    @ApiProperty({
        description: 'Soft delete flag',
        example: false,
    })
    isDeleted: boolean;

    @ApiProperty({
        description: 'Creation timestamp',
        example: '2024-01-15T10:30:00.000Z',
    })
    createdAt: Date;

    @ApiProperty({
        description: 'Last update timestamp',
        example: '2024-01-15T10:30:00.000Z',
    })
    updatedAt: Date;
}
