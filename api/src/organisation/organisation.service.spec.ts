import { Test, TestingModule } from '@nestjs/testing';
import { OrganisationService } from './organisation.service';
import { PrismaService } from '../database/prisma.service';
import {
    ConflictException,
    NotFoundException,
    ForbiddenException,
} from '@nestjs/common';
import { Role } from '../common/enums';

describe('OrganisationService', () => {
    let service: OrganisationService;
    let prismaService: PrismaService;

    const mockPrismaService = {
        organisation: {
            create: jest.fn(),
            findMany: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
        },
    };

    const mockOrganisation = {
        id: 'org-123',
        name: 'Test Org',
        slug: 'test-org',
        availableIndianChannels: 0,
        availableInternationalChannels: 0,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                OrganisationService,
                {
                    provide: PrismaService,
                    useValue: mockPrismaService,
                },
            ],
        }).compile();

        service = module.get<OrganisationService>(OrganisationService);
        prismaService = module.get<PrismaService>(PrismaService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should create a new organisation and assign creator as OWNER', async () => {
            const createDto = { name: 'Test Org', slug: 'test-org' };
            const userId = 'user-123';

            mockPrismaService.organisation.findUnique.mockResolvedValue(null);
            mockPrismaService.organisation.create.mockResolvedValue(
                mockOrganisation,
            );

            const result = await service.create(createDto, userId);

            expect(result).toEqual(
                expect.objectContaining({
                    id: mockOrganisation.id,
                    name: mockOrganisation.name,
                    slug: mockOrganisation.slug,
                }),
            );
            expect(mockPrismaService.organisation.create).toHaveBeenCalledWith({
                data: {
                    name: createDto.name,
                    slug: createDto.slug,
                    userOrganisations: {
                        create: {
                            userId,
                            role: Role.OWNER,
                        },
                    },
                },
            });
        });

        it('should throw ConflictException if slug already exists', async () => {
            const createDto = { name: 'Test Org', slug: 'test-org' };
            const userId = 'user-123';

            mockPrismaService.organisation.findUnique.mockResolvedValue(
                mockOrganisation,
            );

            await expect(service.create(createDto, userId)).rejects.toThrow(
                ConflictException,
            );
            await expect(service.create(createDto, userId)).rejects.toThrow(
                'Organisation slug already exists',
            );
        });
    });

    describe('findAll', () => {
        it('should return all organisations for super admin', async () => {
            const userId = 'user-123';
            const isSuperAdmin = true;

            mockPrismaService.organisation.findMany.mockResolvedValue([
                mockOrganisation,
            ]);

            const result = await service.findAll(userId, isSuperAdmin);

            expect(result).toHaveLength(1);
            expect(
                mockPrismaService.organisation.findMany,
            ).toHaveBeenCalledWith({
                where: { isDeleted: false },
                orderBy: { createdAt: 'desc' },
            });
        });

        it('should return only user organisations for regular user', async () => {
            const userId = 'user-123';
            const isSuperAdmin = false;

            mockPrismaService.organisation.findMany.mockResolvedValue([
                mockOrganisation,
            ]);

            const result = await service.findAll(userId, isSuperAdmin);

            expect(result).toHaveLength(1);
            expect(
                mockPrismaService.organisation.findMany,
            ).toHaveBeenCalledWith({
                where: {
                    isDeleted: false,
                    userOrganisations: {
                        some: {
                            userId,
                            isDeleted: false,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
            });
        });
    });

    describe('findOne', () => {
        it('should return organisation for super admin', async () => {
            const orgId = 'org-123';
            const userId = 'user-123';
            const isSuperAdmin = true;

            mockPrismaService.organisation.findUnique.mockResolvedValue({
                ...mockOrganisation,
                userOrganisations: [],
            });

            const result = await service.findOne(orgId, userId, isSuperAdmin);

            expect(result.id).toBe(orgId);
        });

        it('should throw NotFoundException if organisation not found', async () => {
            const orgId = 'org-123';
            const userId = 'user-123';
            const isSuperAdmin = false;

            mockPrismaService.organisation.findUnique.mockResolvedValue(null);

            await expect(
                service.findOne(orgId, userId, isSuperAdmin),
            ).rejects.toThrow(NotFoundException);
        });

        it('should throw ForbiddenException if user has no access', async () => {
            const orgId = 'org-123';
            const userId = 'user-123';
            const isSuperAdmin = false;

            mockPrismaService.organisation.findUnique.mockResolvedValue({
                ...mockOrganisation,
                userOrganisations: [],
            });

            await expect(
                service.findOne(orgId, userId, isSuperAdmin),
            ).rejects.toThrow(ForbiddenException);
        });
    });

    describe('update', () => {
        it('should update organisation as OWNER', async () => {
            const orgId = 'org-123';
            const userId = 'user-123';
            const isSuperAdmin = false;
            const updateDto = { name: 'Updated Org' };

            mockPrismaService.organisation.findUnique.mockResolvedValue({
                ...mockOrganisation,
                userOrganisations: [
                    { userId, role: Role.OWNER, isDeleted: false },
                ],
            });
            mockPrismaService.organisation.update.mockResolvedValue({
                ...mockOrganisation,
                name: 'Updated Org',
            });

            const result = await service.update(
                orgId,
                updateDto,
                userId,
                isSuperAdmin,
            );

            expect(result.name).toBe('Updated Org');
        });

        it('should throw ForbiddenException if user is MEMBER', async () => {
            const orgId = 'org-123';
            const userId = 'user-123';
            const isSuperAdmin = false;
            const updateDto = { name: 'Updated Org' };

            mockPrismaService.organisation.findUnique.mockResolvedValue({
                ...mockOrganisation,
                userOrganisations: [
                    { userId, role: Role.MEMBER, isDeleted: false },
                ],
            });

            await expect(
                service.update(orgId, updateDto, userId, isSuperAdmin),
            ).rejects.toThrow(ForbiddenException);
        });
    });

    describe('remove', () => {
        it('should soft delete organisation as OWNER', async () => {
            const orgId = 'org-123';
            const userId = 'user-123';
            const isSuperAdmin = false;

            mockPrismaService.organisation.findUnique.mockResolvedValue({
                ...mockOrganisation,
                userOrganisations: [
                    { userId, role: Role.OWNER, isDeleted: false },
                ],
            });
            mockPrismaService.organisation.update.mockResolvedValue({
                ...mockOrganisation,
                isDeleted: true,
            });

            const result = await service.remove(orgId, userId, isSuperAdmin);

            expect(result.isDeleted).toBe(true);
        });

        it('should throw ForbiddenException if user is not OWNER', async () => {
            const orgId = 'org-123';
            const userId = 'user-123';
            const isSuperAdmin = false;

            mockPrismaService.organisation.findUnique.mockResolvedValue({
                ...mockOrganisation,
                userOrganisations: [
                    { userId, role: Role.ADMIN, isDeleted: false },
                ],
            });

            await expect(
                service.remove(orgId, userId, isSuperAdmin),
            ).rejects.toThrow(ForbiddenException);
        });
    });
});
