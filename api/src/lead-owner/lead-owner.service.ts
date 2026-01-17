import {
    Injectable,
    NotFoundException,
    ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateLeadOwnerDto } from './dto/create-lead-owner.dto';
import { UpdateLeadOwnerDto } from './dto/update-lead-owner.dto';
import { LeadOwnerEntity } from './entities/lead-owner.entity';

@Injectable()
export class LeadOwnerService {
    constructor(private readonly prisma: PrismaService) {}

    async create(
        createLeadOwnerDto: CreateLeadOwnerDto,
    ): Promise<LeadOwnerEntity> {
        // Check if lead owner with this ID already exists
        const existingLeadOwner = await this.prisma.leadOwner.findUnique({
            where: { id: createLeadOwnerDto.id },
        });

        if (existingLeadOwner) {
            throw new ConflictException(
                'Lead owner with this ID already exists',
            );
        }

        const leadOwner = await this.prisma.leadOwner.create({
            data: createLeadOwnerDto,
        });

        return new LeadOwnerEntity(leadOwner);
    }

    async findAll(): Promise<LeadOwnerEntity[]> {
        const leadOwners = await this.prisma.leadOwner.findMany({
            where: { isDeleted: false },
            orderBy: { createdAt: 'desc' },
        });

        return leadOwners.map((owner) => new LeadOwnerEntity(owner));
    }

    async findOne(id: string): Promise<LeadOwnerEntity> {
        const leadOwner = await this.prisma.leadOwner.findUnique({
            where: { id },
        });

        if (!leadOwner || leadOwner.isDeleted) {
            throw new NotFoundException('Lead owner not found');
        }

        return new LeadOwnerEntity(leadOwner);
    }

    async update(
        id: string,
        updateLeadOwnerDto: UpdateLeadOwnerDto,
    ): Promise<LeadOwnerEntity> {
        const leadOwner = await this.prisma.leadOwner.findUnique({
            where: { id },
        });

        if (!leadOwner || leadOwner.isDeleted) {
            throw new NotFoundException('Lead owner not found');
        }

        const updated = await this.prisma.leadOwner.update({
            where: { id },
            data: updateLeadOwnerDto,
        });

        return new LeadOwnerEntity(updated);
    }

    async remove(id: string): Promise<LeadOwnerEntity> {
        const leadOwner = await this.prisma.leadOwner.findUnique({
            where: { id },
        });

        if (!leadOwner || leadOwner.isDeleted) {
            throw new NotFoundException('Lead owner not found');
        }

        // Soft delete
        const deleted = await this.prisma.leadOwner.update({
            where: { id },
            data: { isDeleted: true },
        });

        return new LeadOwnerEntity(deleted);
    }
}
