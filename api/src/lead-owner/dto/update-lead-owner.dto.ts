import { PartialType } from '@nestjs/mapped-types';
import { CreateLeadOwnerDto } from './create-lead-owner.dto';

export class UpdateLeadOwnerDto extends PartialType(CreateLeadOwnerDto) {}
