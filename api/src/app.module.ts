import { Module } from '@nestjs/common';
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { OrganisationModule } from './organisation/organisation.module';
import { UserOrganisationModule } from './user-organisation/user-organisation.module';
import { LeadModule } from './lead/lead.module';
import { LeadOwnerModule } from './lead-owner/lead-owner.module';
import { ChatModule } from './chat/chat.module';
import { ChatMessageModule } from './chat-message/chat-message.module';
import { AgentModule } from './agent/agent.module';
import { CallModule } from './call/call.module';
import { CallMessageModule } from './call-message/call-message.module';
import { AgentLeadCallScheduleModule } from './agent-lead-call-schedule/agent-lead-call-schedule.module';
import { ExecutionModule } from './execution/execution.module';
import { HistoryModule } from './history/history.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    AuthModule,
    UserModule,
    OrganisationModule,
    UserOrganisationModule,
    LeadModule,
    LeadOwnerModule,
    ChatModule,
    ChatMessageModule,
    AgentModule,
    CallModule,
    CallMessageModule,
    AgentLeadCallScheduleModule,
    ExecutionModule,
    HistoryModule,
    HealthModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
})
export class AppModule {}
