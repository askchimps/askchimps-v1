import { Test, TestingModule } from '@nestjs/testing';
import { TagService } from './tag.service';
import { PrismaService } from '../database/prisma.service';
import {
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { ROLE } from '@prisma/client';

describe('TagService', () => {
  let service: TagService;
  let prisma: PrismaService;

  const mockPrismaService = {
    tag: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    userOrganisation: {
      findFirst: jest.fn(),
    },
  };

  const mockTag = {
    id: '01HZXYZ1234567890ABCDEFGHJL',
    name: 'High Priority',
    slug: 'high-priority',
    organisationId: '01HZXYZ1234567890ABCDEFGHJK',
    isDeleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUserOrg = {
    id: '01HZXYZ1234567890ABCDEFGHJM',
    userId: '01HZXYZ1234567890ABCDEFGHJN',
    organisationId: '01HZXYZ1234567890ABCDEFGHJK',
    role: ROLE.ADMIN,
    isDeleted: false,
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TagService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<TagService>(TagService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createTagDto: CreateTagDto = {
      name: 'High Priority',
      slug: 'high-priority',
      organisationId: '01HZXYZ1234567890ABCDEFGHJK',
    };

    it('should create a tag successfully', async () => {
      mockPrismaService.userOrganisation.findFirst.mockResolvedValue(
        mockUserOrg,
      );
      mockPrismaService.tag.findFirst.mockResolvedValue(null);
      mockPrismaService.tag.create.mockResolvedValue(mockTag);

      const result = await service.create(
        createTagDto,
        mockUserOrg.userId,
        false,
      );

      expect(result).toBeDefined();
      expect(result.id).toBe(mockTag.id);
    });

    it('should throw ForbiddenException if user has no access', async () => {
      mockPrismaService.userOrganisation.findFirst.mockResolvedValue(null);

      await expect(
        service.create(createTagDto, mockUserOrg.userId, false),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ConflictException if slug already exists', async () => {
      mockPrismaService.userOrganisation.findFirst.mockResolvedValue(
        mockUserOrg,
      );
      mockPrismaService.tag.findFirst.mockResolvedValue(mockTag);

      await expect(
        service.create(createTagDto, mockUserOrg.userId, false),
      ).rejects.toThrow(ConflictException);
    });

    it('should skip permission check for super admin', async () => {
      mockPrismaService.tag.findFirst.mockResolvedValue(null);
      mockPrismaService.tag.create.mockResolvedValue(mockTag);

      const result = await service.create(
        createTagDto,
        mockUserOrg.userId,
        true,
      );

      expect(result).toBeDefined();
      expect(
        mockPrismaService.userOrganisation.findFirst,
      ).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all tags for organisation', async () => {
      mockPrismaService.userOrganisation.findFirst.mockResolvedValue(
        mockUserOrg,
      );
      mockPrismaService.tag.findMany.mockResolvedValue([mockTag]);

      const result = await service.findAll(
        '01HZXYZ1234567890ABCDEFGHJK',
        mockUserOrg.userId,
        false,
      );

      expect(result).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('should return a tag by id', async () => {
      mockPrismaService.userOrganisation.findFirst.mockResolvedValue(
        mockUserOrg,
      );
      mockPrismaService.tag.findFirst.mockResolvedValue(mockTag);

      const result = await service.findOne(
        '01HZXYZ1234567890ABCDEFGHJK',
        mockTag.id,
        mockUserOrg.userId,
        false,
      );

      expect(result).toBeDefined();
    });
  });

  describe('update', () => {
    const updateDto: UpdateTagDto = {
      name: 'Updated Tag',
    };

    it('should update a tag successfully', async () => {
      mockPrismaService.userOrganisation.findFirst.mockResolvedValue(
        mockUserOrg,
      );
      mockPrismaService.tag.findFirst
        .mockResolvedValueOnce(mockTag)
        .mockResolvedValueOnce(null);
      mockPrismaService.tag.update.mockResolvedValue({
        ...mockTag,
        ...updateDto,
      });

      const result = await service.update(
        '01HZXYZ1234567890ABCDEFGHJK',
        mockTag.id,
        updateDto,
        mockUserOrg.userId,
        false,
      );

      expect(result).toBeDefined();
    });
  });

  describe('remove', () => {
    it('should soft delete a tag successfully', async () => {
      mockPrismaService.userOrganisation.findFirst.mockResolvedValue(
        mockUserOrg,
      );
      mockPrismaService.tag.findFirst.mockResolvedValue(mockTag);
      mockPrismaService.tag.update.mockResolvedValue({
        ...mockTag,
        isDeleted: true,
      });

      // Workaround: Call mock once to "activate" it
      await mockPrismaService.tag.findFirst();

      const result = await service.remove(
        mockTag.id,
        '01HZXYZ1234567890ABCDEFGHJK',
        mockUserOrg.userId,
        false,
      );

      expect(result).toBeDefined();
      expect(mockPrismaService.tag.update).toHaveBeenCalled();
    });
  });
});
