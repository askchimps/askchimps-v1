import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateAgentDto } from './dto/create-agent.dto';
import { UpdateAgentDto } from './dto/update-agent.dto';
import { AgentEntity } from './entities/agent.entity';

@Injectable()
export class AgentService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createAgentDto: CreateAgentDto,
    userId: string,
    isSuperAdmin: boolean,
  ): Promise<AgentEntity> {
    // Verify organisation exists
    const organisation = await this.prisma.organisation.findUnique({
      where: { id: createAgentDto.organisationId },
    });

    if (!organisation || organisation.isDeleted) {
      throw new NotFoundException('Organisation not found');
    }

    // Check user has access to organisation
    if (!isSuperAdmin) {
      const userOrg = await this.prisma.userOrganisation.findFirst({
        where: {
          userId,
          organisationId: createAgentDto.organisationId,
          isDeleted: false,
        },
      });

      if (!userOrg) {
        throw new ForbiddenException('You do not have access to this organisation');
      }
    }

    // Check if slug already exists
    const existingAgent = await this.prisma.agent.findUnique({
      where: { slug: createAgentDto.slug },
    });

    if (existingAgent) {
      throw new ConflictException('An agent with this slug already exists');
    }

    const agent = await this.prisma.agent.create({
      data: createAgentDto,
    });

    return new AgentEntity(agent);
  }

  async findAll(
    organisationId: string,
    userId: string,
    isSuperAdmin: boolean,
  ): Promise<AgentEntity[]> {
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
        throw new ForbiddenException('You do not have access to this organisation');
      }
    }

    const agents = await this.prisma.agent.findMany({
      where: {
        organisationId,
        isDeleted: false,
      },
      orderBy: { createdAt: 'desc' },
    });

    return agents.map((agent) => new AgentEntity(agent));
  }

  async findOne(
    id: string,
    organisationId: string,
    userId: string,
    isSuperAdmin: boolean,
  ): Promise<AgentEntity> {
    const agent = await this.prisma.agent.findUnique({
      where: { id },
    });

    if (!agent || agent.isDeleted || agent.organisationId !== organisationId) {
      throw new NotFoundException('Agent not found');
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
        throw new ForbiddenException('You do not have access to this organisation');
      }
    }

    return new AgentEntity(agent);
  }

  async update(
    id: string,
    organisationId: string,
    updateAgentDto: UpdateAgentDto,
    userId: string,
    isSuperAdmin: boolean,
  ): Promise<AgentEntity> {
    const agent = await this.prisma.agent.findUnique({
      where: { id },
    });

    if (!agent || agent.isDeleted || agent.organisationId !== organisationId) {
      throw new NotFoundException('Agent not found');
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
        throw new ForbiddenException('You do not have access to this organisation');
      }
    }

    // Check if slug is being updated and already exists
    if (updateAgentDto.slug && updateAgentDto.slug !== agent.slug) {
      const existingAgent = await this.prisma.agent.findUnique({
        where: { slug: updateAgentDto.slug },
      });

      if (existingAgent) {
        throw new ConflictException('An agent with this slug already exists');
      }
    }

    const updated = await this.prisma.agent.update({
      where: { id },
      data: updateAgentDto,
    });

    return new AgentEntity(updated);
  }

  async remove(
    id: string,
    organisationId: string,
    userId: string,
    isSuperAdmin: boolean,
  ): Promise<AgentEntity> {
    const agent = await this.prisma.agent.findUnique({
      where: { id },
    });

    if (!agent || agent.isDeleted || agent.organisationId !== organisationId) {
      throw new NotFoundException('Agent not found');
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
        throw new ForbiddenException('You do not have access to this organisation');
      }
    }

    // Soft delete
    const deleted = await this.prisma.agent.update({
      where: { id },
      data: { isDeleted: true },
    });

    return new AgentEntity(deleted);
  }
}

