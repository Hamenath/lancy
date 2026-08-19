import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { StripeMockPaymentProvider } from './providers/stripe-mock-payment.provider';
import { FeeService } from '../finance/fee.service';
import { LedgerService } from '../finance/ledger.service';
import { DatabaseModule } from '../database/database.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [DatabaseModule, NotificationsModule],
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    StripeMockPaymentProvider,
    FeeService,
    LedgerService,
  ],
  exports: [PaymentsService, LedgerService, FeeService],
})
export class PaymentsModule {}
