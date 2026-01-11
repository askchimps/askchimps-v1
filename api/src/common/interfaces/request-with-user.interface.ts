import { Request } from 'express';
import { Role } from '../enums';

export interface UserPayload {
  sub: string;
  email: string;
  isSuperAdmin: boolean;
}

export interface RequestWithUser extends Request {
  user: UserPayload;
}

export interface OrganisationContext {
  organisationId: string;
  role: Role;
}

