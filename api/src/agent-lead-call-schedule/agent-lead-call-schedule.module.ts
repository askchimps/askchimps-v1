import { Module } from '@nestjs/common';
import { AgentLeadCallScheduleService } from './agent-lead-call-schedule.service';
import { AgentLeadCallScheduleController } from './agent-lead-call-schedule.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
    imports: [DatabaseModule],
    controllers: [AgentLeadCallScheduleController],
    providers: [AgentLeadCallScheduleService],
    exports: [AgentLeadCallScheduleService],
})
export class AgentLeadCallScheduleModule {}
