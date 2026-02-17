import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { QueryCustomerDto } from './dto/query-customer.dto';
import { BulkCreateCustomerDto } from './dto/bulk-create-customer.dto';
import { CustomerEntity } from './entities/customer.entity';
import { Public } from '../common/decorators';

@ApiTags('Customers')
@Public()
@Controller('customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new customer',
    description: 'Create a new customer with the provided details. All fields are optional.',
  })
  @ApiResponse({
    status: 201,
    description: 'Customer created successfully',
    schema: {
      example: {
        data: {
          id: 1,
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
        statusCode: 201,
        timestamp: '2024-01-15T10:30:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid input' })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Email or phone already exists (if provided)',
  })
  async create(@Body() createCustomerDto: CreateCustomerDto) {
    const data = await this.customerService.create(createCustomerDto);
    return {
      data,
      statusCode: HttpStatus.CREATED,
      timestamp: new Date().toISOString(),
    };
  }

  @Get()
  @ApiOperation({
    summary: 'Get all customers',
    description:
      'Retrieve all customers with optional filtering, search, and pagination',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search by first name, last name, email, phone, or company',
    example: 'John',
  })
  @ApiQuery({
    name: 'company',
    required: false,
    description: 'Filter by company name',
    example: 'Acme Corporation',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of records to return',
    example: 50,
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    type: Number,
    description: 'Number of records to skip',
    example: 0,
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: ['asc', 'desc'],
    description: 'Sort order',
    example: 'desc',
  })
  @ApiResponse({
    status: 200,
    description: 'Customers retrieved successfully',
    schema: {
      example: {
        data: [
          {
            id: 1,
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
        ],
        total: 100,
        limit: 50,
        offset: 0,
        statusCode: 200,
        timestamp: '2024-01-15T10:30:00.000Z',
      },
    },
  })
  async findAll(@Query() queryDto: QueryCustomerDto) {
    const result = await this.customerService.findAll(queryDto);
    return {
      ...result,
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
    };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get customer by ID',
    description: 'Retrieve a single customer by their ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Customer ID',
    example: 1,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Customer retrieved successfully',
    schema: {
      example: {
        data: {
          id: 1,
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
        statusCode: 200,
        timestamp: '2024-01-15T10:30:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const data = await this.customerService.findOne(id);
    return {
      data,
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
    };
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update customer',
    description: 'Update customer details by ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Customer ID',
    example: 1,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Customer updated successfully',
    schema: {
      example: {
        data: {
          id: 1,
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
        statusCode: 200,
        timestamp: '2024-01-15T10:30:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Email or phone already exists',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ) {
    const data = await this.customerService.update(id, updateCustomerDto);
    return {
      data,
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete customer',
    description: 'Delete a customer by ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Customer ID',
    example: 1,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Customer deleted successfully',
    schema: {
      example: {
        message: 'Customer with ID 1 has been deleted successfully',
        statusCode: 200,
        timestamp: '2024-01-15T10:30:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    const result = await this.customerService.remove(id);
    return {
      ...result,
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('bulk')
  @ApiOperation({
    summary: 'Bulk create customers',
    description:
      'Create multiple customers at once (max 500). Automatically skips duplicate records (based on email or phone) and continues processing the rest. No errors are thrown for duplicates.',
  })
  @ApiResponse({
    status: 201,
    description: 'Bulk upload completed. Duplicates are automatically skipped.',
    schema: {
      example: {
        data: {
          created: [
            {
              id: 1,
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
              id: 2,
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
          summary: {
            total: 250,
            successful: 248,
            skipped: 2,
          },
        },
        statusCode: 201,
        timestamp: '2024-01-15T10:30:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid input data or exceeds max limit (500)',
  })
  async bulkCreate(@Body() bulkCreateDto: BulkCreateCustomerDto) {
    const data = await this.customerService.bulkCreate(
      bulkCreateDto.customers,
    );
    return {
      data,
      statusCode: HttpStatus.CREATED,
      timestamp: new Date().toISOString(),
    };
  }
}
