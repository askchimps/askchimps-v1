import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { QueryCustomerDto } from './dto/query-customer.dto';
import { CustomerEntity } from './entities/customer.entity';

@Injectable()
export class CustomerService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new customer
   */
  async create(createCustomerDto: CreateCustomerDto): Promise<CustomerEntity> {
    try {
      const customer = await this.prisma.customers.create({
        data: createCustomerDto,
      });

      return new CustomerEntity(customer);
    } catch (error: any) {
      if (error.code === 'P2002') {
        const target = (error.meta?.target as string[]) || [];
        if (target.includes('email')) {
          throw new ConflictException('Email already exists');
        }
        if (target.includes('phone')) {
          throw new ConflictException('Phone number already exists');
        }
        throw new ConflictException('Customer already exists');
      }
      throw error;
    }
  }

  /**
   * Find all customers with optional filtering and pagination
   */
  async findAll(queryDto: QueryCustomerDto): Promise<{
    data: CustomerEntity[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const { search, company, limit = 50, offset = 0, sortOrder = 'desc' } = queryDto;

    const where: any = {};

    // Search across multiple fields
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
        { company: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Filter by company
    if (company) {
      where.company = { contains: company, mode: 'insensitive' };
    }

    // Execute queries in parallel for better performance
    const [customers, total] = await Promise.all([
      this.prisma.customers.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: {
          id: sortOrder,
        },
      }),
      this.prisma.customers.count({ where }),
    ]);

    return {
      data: customers.map((customer) => new CustomerEntity(customer)),
      total,
      limit,
      offset,
    };
  }

  /**
   * Find a single customer by ID
   */
  async findOne(id: number): Promise<CustomerEntity> {
    const customer = await this.prisma.customers.findUnique({
      where: { id },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    return new CustomerEntity(customer);
  }

  /**
   * Update a customer
   */
  async update(
    id: number,
    updateCustomerDto: UpdateCustomerDto,
  ): Promise<CustomerEntity> {
    // Check if customer exists
    await this.findOne(id);

    try {
      const customer = await this.prisma.customers.update({
        where: { id },
        data: updateCustomerDto,
      });

      return new CustomerEntity(customer);
    } catch (error: any) {
      if (error.code === 'P2002') {
        const target = (error.meta?.target as string[]) || [];
        if (target.includes('email')) {
          throw new ConflictException('Email already exists');
        }
        if (target.includes('phone')) {
          throw new ConflictException('Phone number already exists');
        }
        throw new ConflictException('Customer already exists');
      }
      throw error;
    }
  }

  /**
   * Delete a customer (hard delete)
   */
  async remove(id: number): Promise<{ message: string }> {
    // Check if customer exists
    await this.findOne(id);

    await this.prisma.customers.delete({
      where: { id },
    });

    return { message: `Customer with ID ${id} has been deleted successfully` };
  }

  /**
   * Bulk create customers with batch processing
   * Skips duplicate records (based on email or phone) and continues processing
   */
  async bulkCreate(customers: CreateCustomerDto[]): Promise<{
    created: CustomerEntity[];
    summary: { total: number; successful: number; skipped: number };
  }> {
    const created: CustomerEntity[] = [];
    let skippedCount = 0;

    // Process in batches for better performance
    const batchSize = 50;
    for (let i = 0; i < customers.length; i += batchSize) {
      const batch = customers.slice(i, i + batchSize);

      const results = await Promise.allSettled(
        batch.map(async (customer) => {
          try {
            const result = await this.prisma.customers.create({
              data: customer,
            });
            return {
              success: true as const,
              data: new CustomerEntity(result)
            };
          } catch (error: any) {
            // Skip duplicates silently (P2002 is unique constraint violation)
            if (error.code === 'P2002') {
              return {
                success: false as const,
                reason: 'duplicate'
              };
            }
            // For other errors, also skip but could log them
            return {
              success: false as const,
              reason: 'error'
            };
          }
        })
      );

      // Process results
      results.forEach((result) => {
        if (result.status === 'fulfilled') {
          if (result.value.success) {
            created.push(result.value.data);
          } else {
            skippedCount++;
          }
        } else {
          // Promise rejected - count as skipped
          skippedCount++;
        }
      });
    }

    return {
      created,
      summary: {
        total: customers.length,
        successful: created.length,
        skipped: skippedCount,
      },
    };
  }
}

