import { Module } from '@nestjs/common';
import { OrganisationService } from './organisation.service';
import { OrganisationController } from './organisation.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
    imports: [DatabaseModule],
    controllers: [OrganisationController],
    providers: [OrganisationService],
    exports: [OrganisationService],
})
export class OrganisationModule {}
