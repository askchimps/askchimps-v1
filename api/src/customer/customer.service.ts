import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { QueryCustomerDto } from './dto/query-customer.dto';
import { CustomerEntity } from './entities/customer.entity';

@Injectable()
export class CustomerService {
  constructor(private readonly prisma: PrismaService) { }

  /**
   * Create a new customer
   */
  async create(createCustomerDto: CreateCustomerDto): Promise<CustomerEntity> {
    try {
      console.log(
        `[CustomerService] Creating customer with email: ${createCustomerDto.email || 'N/A'}, phone: ${createCustomerDto.phone || 'N/A'}`,
      );

      const customer = await this.prisma.customers.create({
        data: createCustomerDto,
      });

      console.log(`[CustomerService] Customer created successfully with ID: ${customer.id}`);
      return new CustomerEntity(customer);
    } catch (error: any) {
      if (error.code === 'P2002') {
        const target = (error.meta?.target as string[]) || [];
        if (target.includes('email')) {
          console.warn(
            `[CustomerService] Duplicate email attempted: ${createCustomerDto.email}`,
          );
          throw new ConflictException('Email already exists');
        }
        if (target.includes('phone')) {
          console.warn(
            `[CustomerService] Duplicate phone attempted: ${createCustomerDto.phone}`,
          );
          throw new ConflictException('Phone number already exists');
        }
        console.warn(
          `[CustomerService] Duplicate customer attempted: ${JSON.stringify(createCustomerDto)}`,
        );
        throw new ConflictException('Customer already exists');
      }

      console.error(
        `[CustomerService] Error creating customer: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to create customer');
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
    try {
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
    } catch (error: any) {
      throw new InternalServerErrorException('Failed to fetch customers');
    }
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
    console.log(
      `[CustomerService] Starting bulk customer creation - Total records: ${customers.length}`,
    );

    const created: CustomerEntity[] = [];
    let skippedCount = 0;

    // Process in batches for better performance
    const batchSize = 50;
    for (let i = 0; i < customers.length; i += batchSize) {
      const batch = customers.slice(i, i + batchSize);
      const batchNumber = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(customers.length / batchSize);

      console.log(
        `[CustomerService] Processing batch ${batchNumber}/${totalBatches} (${batch.length} records)`,
      );

      const results = await Promise.allSettled(
        batch.map(async (customer, index) => {
          const globalIndex = i + index;
          console.log(
            `[CustomerService] Attempting to create customer at index ${globalIndex} - Customer Body: ${JSON.stringify(customer)}`,
          );
          try {
            const result = await this.prisma.customers.create({
              data: customer,
            });
            return {
              success: true as const,
              data: new CustomerEntity(result),
              index: globalIndex,
            };
          } catch (error: any) {
            // Log detailed error information
            const customerInfo = {
              index: globalIndex,
              email: customer.email || 'N/A',
              phone: customer.phone || 'N/A',
              firstName: customer.firstName || 'N/A',
              lastName: customer.lastName || 'N/A',
            };

            // Skip duplicates silently (P2002 is unique constraint violation)
            if (error.code === 'P2002') {
              const target = (error.meta?.target as string[]) || [];
              const duplicateField = target.join(', ');

              console.warn(
                `[CustomerService] Duplicate record skipped at index ${globalIndex} - Field: ${duplicateField}, Email: ${customer.email || 'N/A'}, Phone: ${customer.phone || 'N/A'}`,
              );

              return {
                success: false as const,
                reason: 'duplicate',
                index: globalIndex,
              };
            }

            // For other errors, log detailed information
            console.error(
              `[CustomerService] Error creating customer at index ${globalIndex} - Customer: ${JSON.stringify(customerInfo)} ${JSON.stringify(customer)} ${JSON.stringify(batch)}, Error: ${error.message}, Code: ${error.code || 'N/A'}`,
            );
            console.error(`[CustomerService] Stack trace:`, error.stack);

            return {
              success: false as const,
              reason: 'error',
              index: globalIndex,
              error: error.message,
            };
          }
        }),
      );

      // Process results
      let batchCreated = 0;
      let batchSkipped = 0;

      results.forEach((result) => {
        if (result.status === 'fulfilled') {
          if (result.value.success) {
            created.push(result.value.data);
            batchCreated++;
          } else {
            skippedCount++;
            batchSkipped++;
          }
        } else {
          // Promise rejected - count as skipped and log error
          skippedCount++;
          batchSkipped++;
          console.error(
            `[CustomerService] Promise rejected in batch ${batchNumber}: ${result.reason}`,
          );
        }
      });

      console.log(
        `[CustomerService] Batch ${batchNumber}/${totalBatches} completed - Created: ${batchCreated}, Skipped: ${batchSkipped}`,
      );
    }

    const summary = {
      total: customers.length,
      successful: created.length,
      skipped: skippedCount,
    };

    console.log(
      `[CustomerService] Bulk customer creation completed - Total: ${summary.total}, Successful: ${summary.successful}, Skipped: ${summary.skipped}`,
    );

    return {
      created,
      summary,
    };
  }
}

