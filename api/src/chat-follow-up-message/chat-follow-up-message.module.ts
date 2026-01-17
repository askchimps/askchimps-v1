import { Module } from '@nestjs/common';
import { ChatFollowUpMessageService } from './chat-follow-up-message.service';
import { ChatFollowUpMessageController } from './chat-follow-up-message.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
    imports: [DatabaseModule],
    controllers: [ChatFollowUpMessageController],
    providers: [ChatFollowUpMessageService],
    exports: [ChatFollowUpMessageService],
})
export class ChatFollowUpMessageModule {}
