import { Module } from '@nestjs/common';
import { ChatFollowUpScheduleService } from './chat-follow-up-schedule.service';
import { ChatFollowUpScheduleController } from './chat-follow-up-schedule.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [ChatFollowUpScheduleController],
  providers: [ChatFollowUpScheduleService],
  exports: [ChatFollowUpScheduleService],
})
export class ChatFollowUpScheduleModule {}
