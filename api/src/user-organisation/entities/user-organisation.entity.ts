import { ROLE } from '@prisma/client';

export class UserOrganisationEntity {
  id: string;
  userId: string;
  organisationId: string;
  role: ROLE;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<UserOrganisationEntity>) {
    Object.assign(this, partial);
  }
}

