import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateCallMessageDto } from './create-call-message.dto';

export class UpdateCallMessageDto extends PartialType(
    OmitType(CreateCallMessageDto, ['callId', 'organisationId'] as const),
) {}
