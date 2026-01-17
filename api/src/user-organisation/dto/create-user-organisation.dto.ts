import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../common/enums';
import { IsULID } from '../../common/validators/is-ulid.validator';

export class CreateUserOrganisationDto {
  @ApiProperty({
    description: 'User ID (ULID format)',
    example: '01HZXYZ1234567890ABCDEFGHJK',
  })
  @IsString()
  @IsNotEmpty()
  @IsULID()
  userId: string;

  @ApiProperty({
    description: 'Organisation ID (ULID format)',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @IsString()
  @IsNotEmpty()
  @IsULID()
  organisationId: string;

  @ApiProperty({
    description: 'User role in the organisation',
    enum: Role,
    example: Role.ADMIN,
    enumName: 'Role',
  })
  @IsEnum(Role)
  role: Role;
}
