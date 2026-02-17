import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsOptional,
  MaxLength,
  IsObject,
} from 'class-validator';

export class CreateCustomerDto {
  @ApiPropertyOptional({
    description: 'First name of the customer',
    example: 'John',
    maxLength: 100,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  firstName?: string;

  @ApiPropertyOptional({
    description: 'Last name of the customer',
    example: 'Doe',
    maxLength: 100,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  lastName?: string;

  @ApiPropertyOptional({
    description: 'Email address of the customer',
    example: 'john.doe@example.com',
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({
    description: 'Phone number of the customer',
    example: '+1234567890',
    maxLength: 20,
  })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional({
    description: 'Address of the customer (JSON object)',
    example: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA',
    },
  })
  @IsObject()
  @IsOptional()
  address?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Company name',
    example: 'Acme Corporation',
    maxLength: 200,
  })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  company?: string;
}

