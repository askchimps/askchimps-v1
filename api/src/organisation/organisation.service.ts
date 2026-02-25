import {
    Injectable,
    NotFoundException,
    ConflictException,
    ForbiddenException,
    BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateOrganisationDto } from './dto/create-organisation.dto';
import { UpdateOrganisationDto } from './dto/update-organisation.dto';
import { UpdateCreditsDto, CreditOperation } from './dto/update-credits.dto';
import { OrganisationEntity } from './entities/organisation.entity';
import { Role } from '../common/enums';

@Injectable()
export class OrganisationService {
    constructor(private readonly prisma: PrismaService) {}

    async create(
        createOrganisationDto: CreateOrganisationDto,
        userId: string,
    ): Promise<OrganisationEntity> {
        // Check if slug already exists
        const existingOrg = await this.prisma.organisation.findUnique({
            where: { slug: createOrganisationDto.slug },
        });

        if (existingOrg && !existingOrg.isDeleted) {
            throw new ConflictException('Organisation slug already exists');
        }

        // Create organisation and assign creator as OWNER
        const organisation = await this.prisma.organisation.create({
            data: {
                name: createOrganisationDto.name,
                slug: createOrganisationDto.slug,
                ...(createOrganisationDto.availableIndianChannels !==
                    undefined && {
                    availableIndianChannels:
                        createOrganisationDto.availableIndianChannels,
                }),
                ...(createOrganisationDto.availableInternationalChannels !==
                    undefined && {
                    availableInternationalChannels:
                        createOrganisationDto.availableInternationalChannels,
                }),
                ...(createOrganisationDto.credits !== undefined && {
                    credits: createOrganisationDto.credits,
                }),
                ...(createOrganisationDto.chatCredits !== undefined && {
                    chatCredits: createOrganisationDto.chatCredits,
                }),
                ...(createOrganisationDto.callCredits !== undefined && {
                    callCredits: createOrganisationDto.callCredits,
                }),
                userOrganisations: {
                    create: {
                        userId,
                        role: Role.OWNER,
                    },
                },
            },
        });

        return new OrganisationEntity(organisation);
    }

    async findAll(
        userId: string,
        isSuperAdmin: boolean,
    ): Promise<OrganisationEntity[]> {
        const where = isSuperAdmin
            ? { isDeleted: false }
            : {
                  isDeleted: false,
                  userOrganisations: {
                      some: {
                          userId,
                          isDeleted: false,
                      },
                  },
              };

        const organisations = await this.prisma.organisation.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });

        return organisations.map((org) => new OrganisationEntity(org));
    }

    async findOne(
        id: string,
        userId: string,
        isSuperAdmin: boolean,
    ): Promise<OrganisationEntity> {
        const organisation = await this.prisma.organisation.findUnique({
            where: { id },
            include: {
                userOrganisations: {
                    where: { isDeleted: false },
                    include: {
                        user: {
                            select: {
                                id: true,
                                email: true,
                                firstName: true,
                                lastName: true,
                            },
                        },
                    },
                },
            },
        });

        if (!organisation || organisation.isDeleted) {
            throw new NotFoundException('Organisation not found');
        }

        // Check access
        if (!isSuperAdmin) {
            const hasAccess = organisation.userOrganisations.some(
                (uo) => uo.userId === userId,
            );
            if (!hasAccess) {
                throw new ForbiddenException(
                    'You do not have access to this organisation',
                );
            }
        }

        return new OrganisationEntity(organisation);
    }

    async update(
        id: string,
        updateOrganisationDto: UpdateOrganisationDto,
        userId: string,
        isSuperAdmin: boolean,
    ): Promise<OrganisationEntity> {
        const organisation = await this.prisma.organisation.findUnique({
            where: { id },
            include: {
                userOrganisations: {
                    where: { userId, isDeleted: false },
                },
            },
        });

        if (!organisation || organisation.isDeleted) {
            throw new NotFoundException('Organisation not found');
        }

        // Check permissions (OWNER or ADMIN or SuperAdmin)
        if (!isSuperAdmin) {
            const userOrg = organisation.userOrganisations[0];
            if (
                !userOrg ||
                (userOrg.role !== Role.OWNER && userOrg.role !== Role.ADMIN)
            ) {
                throw new ForbiddenException(
                    'Insufficient permissions to update organisation',
                );
            }
        }

        // Check slug uniqueness if being updated
        if (
            updateOrganisationDto.slug &&
            updateOrganisationDto.slug !== organisation.slug
        ) {
            const existingOrg = await this.prisma.organisation.findUnique({
                where: { slug: updateOrganisationDto.slug },
            });

            if (existingOrg && !existingOrg.isDeleted) {
                throw new ConflictException('Organisation slug already exists');
            }
        }

        const updated = await this.prisma.organisation.update({
            where: { id },
            data: updateOrganisationDto,
        });

        return new OrganisationEntity(updated);
    }

    async remove(
        id: string,
        userId: string,
        isSuperAdmin: boolean,
    ): Promise<OrganisationEntity> {
        const organisation = await this.prisma.organisation.findUnique({
            where: { id },
            include: {
                userOrganisations: {
                    where: { userId, isDeleted: false },
                },
            },
        });

        if (!organisation || organisation.isDeleted) {
            throw new NotFoundException('Organisation not found');
        }

        // Only OWNER or SuperAdmin can delete
        if (!isSuperAdmin) {
            const userOrg = organisation.userOrganisations[0];
            if (!userOrg || userOrg.role !== Role.OWNER) {
                throw new ForbiddenException(
                    'Only organisation owners can delete organisations',
                );
            }
        }

        // Soft delete
        const deleted = await this.prisma.organisation.update({
            where: { id },
            data: { isDeleted: true },
        });

        return new OrganisationEntity(deleted);
    }

    async updateCredits(
        id: string,
        updateCreditsDto: UpdateCreditsDto,
        userId: string,
        isSuperAdmin: boolean,
    ): Promise<OrganisationEntity> {
        console.log(
            `[OrganisationService] Updating credits for organisation: ${id}, Operation: ${updateCreditsDto.operation}, Amount: ${updateCreditsDto.amount}`,
        );

        // Find organisation and check permissions
        const organisation = await this.prisma.organisation.findUnique({
            where: { id },
            include: {
                userOrganisations: {
                    where: { userId, isDeleted: false },
                },
            },
        });

        if (!organisation || organisation.isDeleted) {
            console.error(
                `[OrganisationService] Organisation not found: ${id}`,
            );
            throw new NotFoundException('Organisation not found');
        }

        // Check permissions (OWNER or ADMIN or SuperAdmin)
        if (!isSuperAdmin) {
            const userOrg = organisation.userOrganisations[0];
            if (
                !userOrg ||
                (userOrg.role !== Role.OWNER && userOrg.role !== Role.ADMIN)
            ) {
                console.error(
                    `[OrganisationService] Insufficient permissions for user: ${userId}`,
                );
                throw new ForbiddenException(
                    'Insufficient permissions to update credits',
                );
            }
        }

        // Calculate new credits
        let newCredits: number;
        if (updateCreditsDto.operation === CreditOperation.INCREMENT) {
            newCredits = organisation.credits + updateCreditsDto.amount;
            console.log(
                `[OrganisationService] Incrementing credits: ${organisation.credits} + ${updateCreditsDto.amount} = ${newCredits}`,
            );
        } else {
            newCredits = organisation.credits - updateCreditsDto.amount;
            console.log(
                `[OrganisationService] Decrementing credits: ${organisation.credits} - ${updateCreditsDto.amount} = ${newCredits}`,
            );
        }

        // Prevent negative credits
        if (newCredits < 0) {
            console.error(
                `[OrganisationService] Insufficient credits. Current: ${organisation.credits}, Requested: ${updateCreditsDto.amount}`,
            );
            throw new BadRequestException(
                `Insufficient credits. Current credits: ${organisation.credits}, Requested amount: ${updateCreditsDto.amount}`,
            );
        }

        // Update credits
        const updated = await this.prisma.organisation.update({
            where: { id },
            data: { credits: newCredits },
        });

        console.log(
            `[OrganisationService] Credits updated successfully. New balance: ${updated.credits}`,
        );

        return new OrganisationEntity(updated);
    }
}
