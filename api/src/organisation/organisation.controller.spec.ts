import { Test, TestingModule } from '@nestjs/testing';
import { OrganisationController } from './organisation.controller';
import { OrganisationService } from './organisation.service';
import { OrganisationEntity } from './entities/organisation.entity';
import { PrismaService } from '../database/prisma.service';

describe('OrganisationController', () => {
  let controller: OrganisationController;
  let service: OrganisationService;

  const mockOrganisationService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockPrismaService = {
    userOrganisation: {
      findFirst: jest.fn(),
    },
  };

  const mockUser = {
    sub: 'user-123',
    email: 'test@example.com',
    isSuperAdmin: false,
  };

  const mockOrganisation = new OrganisationEntity({
    id: 'org-123',
    name: 'Test Org',
    slug: 'test-org',
    isDeleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrganisationController],
      providers: [
        {
          provide: OrganisationService,
          useValue: mockOrganisationService,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    controller = module.get<OrganisationController>(OrganisationController);
    service = module.get<OrganisationService>(OrganisationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new organisation', async () => {
      const createDto = { name: 'Test Org', slug: 'test-org' };
      mockOrganisationService.create.mockResolvedValue(mockOrganisation);

      const result = await controller.create(createDto, mockUser);

      expect(result).toEqual(mockOrganisation);
      expect(mockOrganisationService.create).toHaveBeenCalledWith(
        createDto,
        mockUser.sub,
      );
    });
  });

  describe('findAll', () => {
    it('should return all organisations', async () => {
      mockOrganisationService.findAll.mockResolvedValue([mockOrganisation]);

      const result = await controller.findAll(mockUser);

      expect(result).toEqual([mockOrganisation]);
      expect(mockOrganisationService.findAll).toHaveBeenCalledWith(
        mockUser.sub,
        mockUser.isSuperAdmin,
      );
    });
  });

  describe('findOne', () => {
    it('should return a single organisation', async () => {
      mockOrganisationService.findOne.mockResolvedValue(mockOrganisation);

      const result = await controller.findOne('org-123', mockUser);

      expect(result).toEqual(mockOrganisation);
      expect(mockOrganisationService.findOne).toHaveBeenCalledWith(
        'org-123',
        mockUser.sub,
        mockUser.isSuperAdmin,
      );
    });
  });

  describe('update', () => {
    it('should update an organisation', async () => {
      const updateDto = { name: 'Updated Org' };
      const updatedOrg = { ...mockOrganisation, name: 'Updated Org' };
      mockOrganisationService.update.mockResolvedValue(updatedOrg);

      const result = await controller.update('org-123', updateDto, mockUser);

      expect(result).toEqual(updatedOrg);
      expect(mockOrganisationService.update).toHaveBeenCalledWith(
        'org-123',
        updateDto,
        mockUser.sub,
        mockUser.isSuperAdmin,
      );
    });
  });

  describe('remove', () => {
    it('should remove an organisation', async () => {
      const deletedOrg = { ...mockOrganisation, isDeleted: true };
      mockOrganisationService.remove.mockResolvedValue(deletedOrg);

      const result = await controller.remove('org-123', mockUser);

      expect(result).toEqual(deletedOrg);
      expect(mockOrganisationService.remove).toHaveBeenCalledWith(
        'org-123',
        mockUser.sub,
        mockUser.isSuperAdmin,
      );
    });
  });
});
