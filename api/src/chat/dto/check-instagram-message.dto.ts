import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CheckInstagramMessageDto {
    @ApiProperty({
        description: 'Instagram message ID to check and cache',
        example: '1234567890_1234567890',
    })
    @IsString()
    @IsNotEmpty()
    messageId: string;
}
