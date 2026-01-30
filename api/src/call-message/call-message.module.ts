import { Module } from '@nestjs/common';
import { CallMessageService } from './call-message.service';
import { CallMessageController } from './call-message.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
    imports: [DatabaseModule],
    controllers: [CallMessageController],
    providers: [CallMessageService],
    exports: [CallMessageService],
})
export class CallMessageModule {}
