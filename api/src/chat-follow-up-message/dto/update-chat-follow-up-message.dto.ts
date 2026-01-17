import { PartialType } from '@nestjs/swagger';
import { CreateChatFollowUpMessageDto } from './create-chat-follow-up-message.dto';

export class UpdateChatFollowUpMessageDto extends PartialType(
  CreateChatFollowUpMessageDto,
) {}
