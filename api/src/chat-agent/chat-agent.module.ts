import { Module } from '@nestjs/common';
import { ChatAgentService } from './chat-agent.service';
import { ChatAgentController } from './chat-agent.controller';

@Module({
  controllers: [ChatAgentController],
  providers: [ChatAgentService],
  exports: [ChatAgentService],
})
export class ChatAgentModule {}

