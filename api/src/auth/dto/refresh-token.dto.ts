import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenDto {
  @ApiProperty({
    description: 'JWT refresh token received during login or registration',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwMUFSWjNOREVLVFNWNFJSRkZRNjlHNUZBViIsImVtYWlsIjoidXNlckBleGFtcGxlLmNvbSIsImlhdCI6MTcwNDQ1NjAwMCwiZXhwIjoxNzA1MDYwODAwfQ.signature',
  })
  @IsString()
  refreshToken: string;
}

