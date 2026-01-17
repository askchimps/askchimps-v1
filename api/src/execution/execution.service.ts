import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateExecutionDto } from './dto/create-execution.dto';
import { UpdateExecutionDto } from './dto/update-execution.dto';
import { ExecutionEntity } from './entities/execution.entity';

@Injectable()
export class ExecutionService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createExecutionDto: CreateExecutionDto,
    userId: string,
    isSuperAdmin: boolean,
  ): Promise<ExecutionEntity> {
    // Verify organisation exists
    const organisation = await this.prisma.organisation.findUnique({
      where: { id: createExecutionDto.organisationId },
    });

    if (!organisation || organisation.isDeleted) {
      throw new NotFoundException('Organisation not found');
    }

    // Check user has access to organisation
    if (!isSuperAdmin) {
      const userOrg = await this.prisma.userOrganisation.findFirst({
        where: {
          userId,
          organisationId: createExecutionDto.organisationId,
          isDeleted: false,
        },
      });

      if (!userOrg) {
        throw new ForbiddenException(
          'You do not have access to this organisation',
        );
      }
    }

    // Verify related entities if provided
    if (createExecutionDto.agentId) {
      const agent = await this.prisma.agent.findUnique({
        where: { id: createExecutionDto.agentId },
      });
      if (
        !agent ||
        agent.isDeleted ||
        agent.organisationId !== createExecutionDto.organisationId
      ) {
        throw new NotFoundException('Agent not found');
      }
    }

    if (createExecutionDto.leadId) {
      const lead = await this.prisma.lead.findUnique({
        where: { id: createExecutionDto.leadId },
      });
      if (
        !lead ||
        lead.isDeleted ||
        lead.organisationId !== createExecutionDto.organisationId
      ) {
        throw new NotFoundException('Lead not found');
      }
    }

    if (createExecutionDto.callId) {
      const call = await this.prisma.call.findUnique({
        where: { id: createExecutionDto.callId },
      });
      if (
        !call ||
        call.isDeleted ||
        call.organisationId !== createExecutionDto.organisationId
      ) {
        throw new NotFoundException('Call not found');
      }
    }

    if (createExecutionDto.chatId) {
      const chat = await this.prisma.chat.findUnique({
        where: { id: createExecutionDto.chatId },
      });
      if (
        !chat ||
        chat.isDeleted ||
        chat.organisationId !== createExecutionDto.organisationId
      ) {
        throw new NotFoundException('Chat not found');
      }
    }

    const execution = await this.prisma.execution.create({
      data: createExecutionDto,
    });

    return new ExecutionEntity(execution);
  }

  async findAll(
    organisationId: string,
    userId: string,
    isSuperAdmin: boolean,
  ): Promise<ExecutionEntity[]> {
    // Verify organisation exists
    const organisation = await this.prisma.organisation.findUnique({
      where: { id: organisationId },
    });

    if (!organisation || organisation.isDeleted) {
      throw new NotFoundException('Organisation not found');
    }

    // Check user has access to organisation
    if (!isSuperAdmin) {
      const userOrg = await this.prisma.userOrganisation.findFirst({
        where: {
          userId,
          organisationId,
          isDeleted: false,
        },
      });

      if (!userOrg) {
        throw new ForbiddenException(
          'You do not have access to this organisation',
        );
      }
    }

    const executions = await this.prisma.execution.findMany({
      where: { organisationId },
      orderBy: { createdAt: 'desc' },
    });

    return executions.map((execution) => new ExecutionEntity(execution));
  }

  async findOne(
    id: string,
    organisationId: string,
    userId: string,
    isSuperAdmin: boolean,
  ): Promise<ExecutionEntity> {
    // Try to find by id first, then by externalId
    let execution = await this.prisma.execution.findUnique({
      where: { id },
    });

    // If not found by id, try externalId
    if (!execution) {
      execution = await this.prisma.execution.findFirst({
        where: { externalId: id },
      });
    }

    if (!execution || execution.organisationId !== organisationId) {
      throw new NotFoundException('Execution not found');
    }

    // Check user has access to organisation
    if (!isSuperAdmin) {
      const userOrg = await this.prisma.userOrganisation.findFirst({
        where: {
          userId,
          organisationId,
          isDeleted: false,
        },
      });

      if (!userOrg) {
        throw new ForbiddenException(
          'You do not have access to this organisation',
        );
      }
    }

    return new ExecutionEntity(execution);
  }

  async update(
    id: string,
    organisationId: string,
    updateExecutionDto: UpdateExecutionDto,
    userId: string,
    isSuperAdmin: boolean,
  ): Promise<ExecutionEntity> {
    // Try to find by id first, then by externalId
    let execution = await this.prisma.execution.findUnique({
      where: { id },
    });

    // If not found by id, try externalId
    if (!execution) {
      execution = await this.prisma.execution.findFirst({
        where: { externalId: id },
      });
    }

    if (!execution || execution.organisationId !== organisationId) {
      throw new NotFoundException('Execution not found');
    }

    // Check user has access to organisation
    if (!isSuperAdmin) {
      const userOrg = await this.prisma.userOrganisation.findFirst({
        where: {
          userId,
          organisationId,
          isDeleted: false,
        },
      });

      if (!userOrg) {
        throw new ForbiddenException(
          'You do not have access to this organisation',
        );
      }
    }

    const updated = await this.prisma.execution.update({
      where: { id: execution.id },
      data: updateExecutionDto,
    });

    return new ExecutionEntity(updated);
  }

  async remove(
    id: string,
    organisationId: string,
    userId: string,
    isSuperAdmin: boolean,
  ): Promise<ExecutionEntity> {
    // Try to find by id first, then by externalId
    let execution = await this.prisma.execution.findUnique({
      where: { id },
    });

    // If not found by id, try externalId
    if (!execution) {
      execution = await this.prisma.execution.findFirst({
        where: { externalId: id },
      });
    }

    if (!execution || execution.organisationId !== organisationId) {
      throw new NotFoundException('Execution not found');
    }

    // Check user has access to organisation
    if (!isSuperAdmin) {
      const userOrg = await this.prisma.userOrganisation.findFirst({
        where: {
          userId,
          organisationId,
          isDeleted: false,
        },
      });

      if (!userOrg) {
        throw new ForbiddenException(
          'You do not have access to this organisation',
        );
      }
    }

    // Hard delete (executions don't have soft delete)
    const deleted = await this.prisma.execution.delete({
      where: { id: execution.id },
    });

    return new ExecutionEntity(deleted);
  }
}
