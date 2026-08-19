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
import { PaymentsModule } from './payments/payments.module';
import { ReviewsModule } from './reviews/reviews.module';
import { SearchModule } from './search/search.module';
import { AdminModule } from './admin/admin.module';

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
    PaymentsModule,
    ReviewsModule,
    SearchModule,
    AdminModule,
  ],
})
export class AppModule {}
