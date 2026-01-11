import { Module } from '@nestjs/common';
import { UserOrganisationService } from './user-organisation.service';
import { UserOrganisationController } from './user-organisation.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [UserOrganisationController],
  providers: [UserOrganisationService],
  exports: [UserOrganisationService],
})
export class UserOrganisationModule {}

