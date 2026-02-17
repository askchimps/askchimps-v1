import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class CustomerEntity {
  @ApiProperty({
    description: 'Customer ID',
    example: 1,
  })
  @Expose()
  id: number;

  @ApiPropertyOptional({
    description: 'First name of the customer',
    example: 'John',
  })
  @Expose()
  firstName?: string | null;

  @ApiPropertyOptional({
    description: 'Last name of the customer',
    example: 'Doe',
  })
  @Expose()
  lastName?: string | null;

  @ApiPropertyOptional({
    description: 'Email address of the customer',
    example: 'john.doe@example.com',
  })
  @Expose()
  email?: string | null;

  @ApiPropertyOptional({
    description: 'Phone number of the customer',
    example: '+1234567890',
  })
  @Expose()
  phone?: string | null;

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
  @Expose()
  address?: any;

  @ApiPropertyOptional({
    description: 'Company name',
    example: 'Acme Corporation',
  })
  @Expose()
  company?: string | null;

  constructor(partial: Partial<CustomerEntity>) {
    Object.assign(this, partial);
  }
}

