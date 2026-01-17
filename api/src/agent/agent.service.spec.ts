import { Test, TestingModule } from '@nestjs/testing';
import { AgentService } from './agent.service';
import { PrismaService } from '../database/prisma.service';
import {
    NotFoundException,
    ConflictException,
    ForbiddenException,
} from '@nestjs/common';

describe('AgentService', () => {
    let service: AgentService;
    let prisma: PrismaService;

    const mockAgent = {
        id: '01HZXYZ1234567890ABCDEFGHJK',
        organisationId: '01HZXYZ1234567890ABCDEFGHJL',
        name: 'Test Agent',
        slug: 'test-agent',
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const mockPrismaService = {
        organisation: {
            findUnique: jest.fn(),
        },
        agent: {
            create: jest.fn(),
            findMany: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
        },
        userOrganisation: {
            findFirst: jest.fn(),
        },
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AgentService,
                {
                    provide: PrismaService,
                    useValue: mockPrismaService,
                },
            ],
        }).compile();

        service = module.get<AgentService>(AgentService);
        prisma = module.get<PrismaService>(PrismaService);

        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        const createAgentDto = {
            name: 'Test Agent',
            slug: 'test-agent',
        };

        it('should create an agent successfully', async () => {
            const createAgentDtoWithOrgId = {
                ...createAgentDto,
                organisationId: '01HZXYZ1234567890ABCDEFGHJL',
            };
            mockPrismaService.organisation.findUnique.mockResolvedValue({
                id: '01HZXYZ1234567890ABCDEFGHJL',
                isDeleted: false,
            });
            mockPrismaService.userOrganisation.findFirst.mockResolvedValue({
                userId: 'user-1',
            });
            mockPrismaService.agent.findUnique.mockResolvedValue(null);
            mockPrismaService.agent.create.mockResolvedValue(mockAgent);

            const result = await service.create(
                '01HZXYZ1234567890ABCDEFGHJL',
                createAgentDtoWithOrgId,
                'user-1',
                false,
            );

            expect(result).toBeDefined();
            expect(result.id).toBe('01HZXYZ1234567890ABCDEFGHJK');
            expect(prisma.agent.create).toHaveBeenCalled();
        });

        it('should throw NotFoundException if organisation not found', async () => {
            mockPrismaService.organisation.findUnique.mockResolvedValue(null);

            await expect(
                service.create(
                    '01HZXYZ1234567890ABCDEFGHJL',
                    createAgentDto,
                    'user-1',
                    false,
                ),
            ).rejects.toThrow(NotFoundException);
        });

        it('should throw ConflictException if slug already exists', async () => {
            const createAgentDtoWithOrgId = {
                ...createAgentDto,
                organisationId: '01HZXYZ1234567890ABCDEFGHJL',
            };
            mockPrismaService.organisation.findUnique.mockResolvedValue({
                id: '01HZXYZ1234567890ABCDEFGHJL',
                isDeleted: false,
            });
            mockPrismaService.userOrganisation.findFirst.mockResolvedValue({
                userId: 'user-1',
            });
            mockPrismaService.agent.findUnique.mockResolvedValue(mockAgent);

            await expect(
                service.create(
                    '01HZXYZ1234567890ABCDEFGHJL',
                    createAgentDtoWithOrgId,
                    'user-1',
                    false,
                ),
            ).rejects.toThrow(ConflictException);
        });
    });

    describe('findAll', () => {
        it('should return all agents for organisation', async () => {
            mockPrismaService.userOrganisation.findFirst.mockResolvedValue({
                userId: 'user-1',
            });
            mockPrismaService.agent.findMany.mockResolvedValue([mockAgent]);

            const result = await service.findAll(
                '01HZXYZ1234567890ABCDEFGHJL',
                'user-1',
                false,
            );

            expect(result).toHaveLength(1);
            expect(result[0].id).toBe('01HZXYZ1234567890ABCDEFGHJK');
        });

        it('should throw ForbiddenException if user has no access', async () => {
            mockPrismaService.userOrganisation.findFirst.mockResolvedValue(
                null,
            );

            await expect(
                service.findAll('01HZXYZ1234567890ABCDEFGHJL', 'user-1', false),
            ).rejects.toThrow(ForbiddenException);
        });

        it('should allow super admin to access any organisation', async () => {
            mockPrismaService.agent.findMany.mockResolvedValue([mockAgent]);

            const result = await service.findAll(
                '01HZXYZ1234567890ABCDEFGHJL',
                'user-1',
                true,
            );

            expect(result).toHaveLength(1);
            expect(prisma.userOrganisation.findFirst).not.toHaveBeenCalled();
        });
    });

    describe('findOne', () => {
        it('should return an agent by id', async () => {
            mockPrismaService.userOrganisation.findFirst.mockResolvedValue({
                userId: 'user-1',
            });
            mockPrismaService.agent.findUnique.mockResolvedValue(mockAgent);

            const result = await service.findOne(
                '01HZXYZ1234567890ABCDEFGHJK',
                '01HZXYZ1234567890ABCDEFGHJL',
                'user-1',
                false,
            );

            expect(result).toBeDefined();
            expect(result.id).toBe('01HZXYZ1234567890ABCDEFGHJK');
        });

        it('should throw NotFoundException if agent not found', async () => {
            mockPrismaService.userOrganisation.findFirst.mockResolvedValue({
                userId: 'user-1',
            });
            mockPrismaService.agent.findUnique.mockResolvedValue(null);

            await expect(
                service.findOne(
                    '01HZXYZ1234567890ABCDEFGHJK',
                    '01HZXYZ1234567890ABCDEFGHJL',
                    'user-1',
                    false,
                ),
            ).rejects.toThrow(NotFoundException);
        });
    });

    describe('update', () => {
        const updateAgentDto = {
            name: 'Updated Agent',
        };

        it('should update an agent successfully', async () => {
            mockPrismaService.userOrganisation.findFirst.mockResolvedValue({
                userId: 'user-1',
            });
            mockPrismaService.agent.findUnique.mockResolvedValue(mockAgent);
            mockPrismaService.agent.update.mockResolvedValue({
                ...mockAgent,
                ...updateAgentDto,
            });

            const result = await service.update(
                '01HZXYZ1234567890ABCDEFGHJK',
                '01HZXYZ1234567890ABCDEFGHJL',
                updateAgentDto,
                'user-1',
                false,
            );

            expect(result).toBeDefined();
            expect(result.name).toBe('Updated Agent');
            expect(prisma.agent.update).toHaveBeenCalled();
        });

        it('should throw NotFoundException if agent not found', async () => {
            mockPrismaService.userOrganisation.findFirst.mockResolvedValue({
                userId: 'user-1',
            });
            mockPrismaService.agent.findUnique.mockResolvedValue(null);

            await expect(
                service.update(
                    '01HZXYZ1234567890ABCDEFGHJK',
                    '01HZXYZ1234567890ABCDEFGHJL',
                    updateAgentDto,
                    'user-1',
                    false,
                ),
            ).rejects.toThrow(NotFoundException);
        });
    });

    describe('remove', () => {
        it('should soft delete an agent successfully', async () => {
            mockPrismaService.userOrganisation.findFirst.mockResolvedValue({
                userId: 'user-1',
            });
            mockPrismaService.agent.findUnique.mockResolvedValue(mockAgent);
            mockPrismaService.agent.update.mockResolvedValue({
                ...mockAgent,
                isDeleted: true,
            });

            const result = await service.remove(
                '01HZXYZ1234567890ABCDEFGHJK',
                '01HZXYZ1234567890ABCDEFGHJL',
                'user-1',
                false,
            );

            expect(result).toBeDefined();
            expect(prisma.agent.update).toHaveBeenCalledWith({
                where: { id: '01HZXYZ1234567890ABCDEFGHJK' },
                data: { isDeleted: true },
            });
        });

        it('should throw NotFoundException if agent not found', async () => {
            mockPrismaService.userOrganisation.findFirst.mockResolvedValue({
                userId: 'user-1',
            });
            mockPrismaService.agent.findUnique.mockResolvedValue(null);

            await expect(
                service.remove(
                    '01HZXYZ1234567890ABCDEFGHJK',
                    '01HZXYZ1234567890ABCDEFGHJL',
                    'user-1',
                    false,
                ),
            ).rejects.toThrow(NotFoundException);
        });
    });
});
