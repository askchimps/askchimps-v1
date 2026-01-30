import { PartialType } from '@nestjs/swagger';
import { CreateChatFollowUpScheduleDto } from './create-chat-follow-up-schedule.dto';

export class UpdateChatFollowUpScheduleDto extends PartialType(
    CreateChatFollowUpScheduleDto,
) {}
