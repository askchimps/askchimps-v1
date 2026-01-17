import {
    Injectable,
    NotFoundException,
    ConflictException,
    ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';

@Injectable()
export class TagService {
    constructor(private readonly prisma: PrismaService) {}

    async create(
        createTagDto: CreateTagDto,
        userId: string,
        isSuperAdmin: boolean,
    ) {
        // Check if user has access to organisation
        if (!isSuperAdmin) {
            const userOrg = await this.prisma.userOrganisation.findFirst({
                where: {
                    userId,
                    organisationId: createTagDto.organisationId,
                    isDeleted: false,
                },
            });

            if (!userOrg) {
                throw new ForbiddenException(
                    'You do not have access to this organisation',
                );
            }
        }

        // Check if slug already exists in organisation
        const existing = await this.prisma.tag.findFirst({
            where: {
                slug: createTagDto.slug,
                organisationId: createTagDto.organisationId,
                isDeleted: false,
            },
        });

        if (existing) {
            throw new ConflictException(
                'Tag with this slug already exists in this organisation',
            );
        }

        return this.prisma.tag.create({
            data: createTagDto,
        });
    }

    async findAll(
        organisationId: string,
        userId: string,
        isSuperAdmin: boolean,
    ) {
        // Check if user has access to organisation
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

        return this.prisma.tag.findMany({
            where: {
                organisationId,
                isDeleted: false,
            },
            orderBy: {
                name: 'asc',
            },
        });
    }

    async findOne(
        id: string,
        organisationId: string,
        userId: string,
        isSuperAdmin: boolean,
    ) {
        // Check if user has access to organisation
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

        const tag = await this.prisma.tag.findFirst({
            where: {
                id,
                organisationId,
                isDeleted: false,
            },
        });

        if (!tag) {
            throw new NotFoundException('Tag not found');
        }

        return tag;
    }

    async update(
        id: string,
        organisationId: string,
        updateTagDto: UpdateTagDto,
        userId: string,
        isSuperAdmin: boolean,
    ) {
        // Check if user has access to organisation
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

        // Check if tag exists
        const tag = await this.prisma.tag.findFirst({
            where: {
                id,
                organisationId,
                isDeleted: false,
            },
        });

        if (!tag) {
            throw new NotFoundException('Tag not found');
        }

        // If slug is being updated, check for conflicts
        if (updateTagDto.slug && updateTagDto.slug !== tag.slug) {
            const existing = await this.prisma.tag.findFirst({
                where: {
                    slug: updateTagDto.slug,
                    organisationId,
                    isDeleted: false,
                    id: { not: id },
                },
            });

            if (existing) {
                throw new ConflictException(
                    'Tag with this slug already exists in this organisation',
                );
            }
        }

        return this.prisma.tag.update({
            where: { id },
            data: updateTagDto,
        });
    }

    async remove(
        id: string,
        organisationId: string,
        userId: string,
        isSuperAdmin: boolean,
    ) {
        // Check if user has access to organisation
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

        // Check if tag exists
        const tag = await this.prisma.tag.findFirst({
            where: {
                id,
                organisationId,
                isDeleted: false,
            },
        });

        if (!tag) {
            throw new NotFoundException('Tag not found');
        }

        // Soft delete
        return this.prisma.tag.update({
            where: { id },
            data: { isDeleted: true },
        });
    }
}
