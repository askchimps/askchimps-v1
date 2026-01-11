import { IsEnum } from 'class-validator';
import { Role } from '../../common/enums';

export class UpdateUserOrganisationDto {
  @IsEnum(Role)
  role: Role;
}

