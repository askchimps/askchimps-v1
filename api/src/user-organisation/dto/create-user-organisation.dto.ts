import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { Role } from '../../common/enums';
import { IsULID } from '../../common/validators/is-ulid.validator';

export class CreateUserOrganisationDto {
  @IsString()
  @IsNotEmpty()
  @IsULID()
  userId: string;

  @IsString()
  @IsNotEmpty()
  @IsULID()
  organisationId: string;

  @IsEnum(Role)
  role: Role;
}

