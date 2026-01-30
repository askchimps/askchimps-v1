import { Module } from '@nestjs/common';
import { LeadOwnerService } from './lead-owner.service';
import { LeadOwnerController } from './lead-owner.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
    imports: [DatabaseModule],
    controllers: [LeadOwnerController],
    providers: [LeadOwnerService],
    exports: [LeadOwnerService],
})
export class LeadOwnerModule {}
