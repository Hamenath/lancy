import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { DisputesService } from './disputes.service';
import { AuditLogService } from './audit-log.service';
import { AdminController } from './admin.controller';
import { DatabaseModule } from '../database/database.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [DatabaseModule, NotificationsModule],
  controllers: [AdminController],
  providers: [AdminService, DisputesService, AuditLogService],
  exports: [AdminService, DisputesService, AuditLogService],
})
export class AdminModule {}
