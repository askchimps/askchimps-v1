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
import { UserOrganisationService } from './user-organisation.service';
import { CreateUserOrganisationDto } from './dto/create-user-organisation.dto';
import { UpdateUserOrganisationDto } from './dto/update-user-organisation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RbacGuard } from '../common/guards/rbac.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '../common/enums';
import type { UserPayload } from '../common/interfaces/request-with-user.interface';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Organisation User')
@ApiBearerAuth('JWT-auth')
@Controller({ path: 'organisation/:organisationId/user', version: '1' })
@UseGuards(JwtAuthGuard)
export class UserOrganisationController {
  constructor(
    private readonly UserOrganisationService: UserOrganisationService,
  ) {}

  @Post()
  @UseGuards(RbacGuard)
  @Roles(Role.OWNER, Role.ADMIN)
  create(
    @Param('organisationId') organisationId: string,
    @Body() createUserOrganisationDto: CreateUserOrganisationDto,
    @CurrentUser() user: UserPayload,
  ) {
    // Ensure organisationId from params matches body
    createUserOrganisationDto.organisationId = organisationId;
    return this.UserOrganisationService.create(
      createUserOrganisationDto,
      user.sub,
      user.isSuperAdmin,
    );
  }

  @Get()
  @UseGuards(RbacGuard)
  @Roles(Role.OWNER, Role.ADMIN, Role.MEMBER)
  findAll(
    @Param('organisationId') organisationId: string,
    @CurrentUser() user: UserPayload,
  ) {
    return this.UserOrganisationService.findAllByOrganisation(
      organisationId,
      user.sub,
      user.isSuperAdmin,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: UserPayload) {
    return this.UserOrganisationService.findOne(id, user.sub, user.isSuperAdmin);
  }

  @Patch(':id')
  @UseGuards(RbacGuard)
  @Roles(Role.OWNER)
  update(
    @Param('organisationId') organisationId: string,
    @Param('id') id: string,
    @Body() updateUserOrganisationDto: UpdateUserOrganisationDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.UserOrganisationService.update(
      id,
      updateUserOrganisationDto,
      user.sub,
      user.isSuperAdmin,
    );
  }

  @Delete(':id')
  @UseGuards(RbacGuard)
  @Roles(Role.OWNER, Role.ADMIN)
  remove(
    @Param('organisationId') organisationId: string,
    @Param('id') id: string,
    @CurrentUser() user: UserPayload,
  ) {
    return this.UserOrganisationService.remove(id, user.sub, user.isSuperAdmin);
  }
}

