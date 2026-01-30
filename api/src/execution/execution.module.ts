import { Module } from '@nestjs/common';
import { ExecutionService } from './execution.service';
import { ExecutionController } from './execution.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
    imports: [DatabaseModule],
    controllers: [ExecutionController],
    providers: [ExecutionService],
    exports: [ExecutionService],
})
export class ExecutionModule {}
