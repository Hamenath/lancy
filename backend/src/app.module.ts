import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { FreelancersModule } from './freelancers/freelancers.module';
import { ProjectsModule } from './projects/projects.module';
import { ProposalsModule } from './proposals/proposals.module';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    UsersModule,
    FreelancersModule,
    ProjectsModule,
    ProposalsModule,
  ],
})
export class AppModule {}
