import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ValidateNested, ArrayMinSize, ArrayMaxSize } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateCustomerDto } from './create-customer.dto';

export class BulkCreateCustomerDto {
  @ApiProperty({
    description: 'Array of customers to create (max 500)',
    type: [CreateCustomerDto],
    minItems: 1,
    maxItems: 500,
    example: [
      {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890',
        address: {
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'USA',
        },
        company: 'Acme Corporation',
      },
      {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        phone: '+0987654321',
        address: {
          street: '456 Oak Ave',
          city: 'Los Angeles',
          state: 'CA',
          zipCode: '90001',
          country: 'USA',
        },
        company: 'Tech Corp',
      },
    ],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(500)
  @ValidateNested({ each: true })
  @Type(() => CreateCustomerDto)
  customers: CreateCustomerDto[];
}

