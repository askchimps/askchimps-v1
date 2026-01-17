import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../database/prisma.service';
import { Role } from '../enums';
import { ROLES_KEY } from '../decorators';
import { RequestWithUser } from '../interfaces/request-with-user.interface';

@Injectable()
export class RbacGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private prisma: PrismaService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredRoles = this.reflector.getAllAndOverride<Role[]>(
            ROLES_KEY,
            [context.getHandler(), context.getClass()],
        );

        if (!requiredRoles) {
            return true;
        }

        const request = context.switchToHttp().getRequest<RequestWithUser>();
        const user = request.user;

        if (!user) {
            throw new ForbiddenException('User not authenticated');
        }

        // Super admin has access to everything
        if (user.isSuperAdmin) {
            return true;
        }

        // Get organisation ID from params or body
        const organisationId =
            request.params.organisationId || request.body.organisationId;

        if (!organisationId) {
            throw new ForbiddenException(
                'Organisation context required for this operation',
            );
        }

        // Check user's role in the organisation
        const userOrg = await this.prisma.userOrganisation.findFirst({
            where: {
                userId: user.sub,
                organisationId,
                isDeleted: false,
            },
        });

        if (!userOrg) {
            throw new ForbiddenException(
                'You do not have access to this organisation',
            );
        }

        // Check if user's role is in the required roles
        if (!requiredRoles.includes(userOrg.role as Role)) {
            throw new ForbiddenException(
                `Insufficient permissions. Required roles: ${requiredRoles.join(', ')}`,
            );
        }

        // Attach organisation context to request for later use
        request['organisationContext'] = {
            organisationId,
            role: userOrg.role,
        };

        return true;
    }
}
