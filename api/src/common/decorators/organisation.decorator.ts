import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const OrganisationId = createParamDecorator(
    (data: unknown, ctx: ExecutionContext): string => {
        const request = ctx.switchToHttp().getRequest();
        return request.params.organisationId || request.body.organisationId;
    },
);
