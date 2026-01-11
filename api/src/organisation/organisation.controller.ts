import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { OrganisationService } from './organisation.service';
import { CreateOrganisationDto } from './dto/create-organisation.dto';
import { UpdateOrganisationDto } from './dto/update-organisation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RbacGuard } from '../common/guards/rbac.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '../common/enums';
import type { UserPayload } from '../common/interfaces/request-with-user.interface';

@ApiTags('Organisation')
@ApiBearerAuth('JWT-auth')
@Controller({ path: 'organisation', version: '1' })
@UseGuards(JwtAuthGuard)
export class OrganisationController {
  constructor(private readonly OrganisationService: OrganisationService) {}

  @Post()
  create(
    @Body() createOrganisationDto: CreateOrganisationDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.OrganisationService.create(createOrganisationDto, user.sub);
  }

  @Get()
  findAll(@CurrentUser() user: UserPayload) {
    return this.OrganisationService.findAll(user.sub, user.isSuperAdmin);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: UserPayload) {
    return this.OrganisationService.findOne(id, user.sub, user.isSuperAdmin);
  }

  @Patch(':organisationId')
  @UseGuards(RbacGuard)
  @Roles(Role.OWNER, Role.ADMIN)
  update(
    @Param('organisationId') organisationId: string,
    @Body() updateOrganisationDto: UpdateOrganisationDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.OrganisationService.update(
      organisationId,
      updateOrganisationDto,
      user.sub,
      user.isSuperAdmin,
    );
  }

  @Delete(':organisationId')
  @UseGuards(RbacGuard)
  @Roles(Role.OWNER)
  remove(@Param('organisationId') organisationId: string, @CurrentUser() user: UserPayload) {
    return this.OrganisationService.remove(organisationId, user.sub, user.isSuperAdmin);
  }
}

