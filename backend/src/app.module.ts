import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { FreelancersModule } from './freelancers/freelancers.module';
import { ProjectsModule } from './projects/projects.module';
import { ProposalsModule } from './proposals/proposals.module';
import { ContractsModule } from './contracts/contracts.module';
import { MilestonesModule } from './milestones/milestones.module';
import { NotificationsModule } from './notifications/notifications.module';
import { MessagingModule } from './messaging/messaging.module';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    UsersModule,
    FreelancersModule,
    ProjectsModule,
    ProposalsModule,
    ContractsModule,
    MilestonesModule,
    NotificationsModule,
    MessagingModule,
  ],
})
export class AppModule {}
