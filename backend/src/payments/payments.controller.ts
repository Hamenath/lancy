import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Headers, 
  UseGuards 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService, InitiatePaymentDto } from './payments.service';
import { LedgerService } from '../finance/ledger.service';
import { FirebaseAuthGuard } from '../common/guards/firebase-auth.guard';
import { CurrentUser, AuthenticatedUser } from '../common/decorators/current-user.decorator';

@ApiTags('payments')
@Controller('api/v1')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly ledgerService: LedgerService,
  ) {}

  @Post('payments')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Initiate payment for an approved milestone (Server derives expected amount)' })
  async initiatePayment(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: InitiatePaymentDto,
  ) {
    return this.paymentsService.initiatePayment(user.id, user.role, dto);
  }

  @Get('payments/me')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get payment history for current user' })
  async getMyPayments(@CurrentUser() user: AuthenticatedUser) {
    return this.paymentsService.getMyPayments(user.id);
  }

  @Get('payments/:id')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get detailed payment record & ledger breakdown' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.paymentsService.findOne(id, user.id, user.role);
  }

  @Post('payments/webhook')
  @ApiOperation({ summary: 'Provider payment webhook endpoint (Signature verification & Idempotency check)' })
  async handleWebhook(
    @Headers() headers: Record<string, any>,
    @Body() rawBody: any,
  ) {
    return this.paymentsService.handleWebhook(headers, rawBody);
  }

  @Post('payments/:id/refund')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Process refund for payment' })
  async refund(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body('reason') reason?: string,
  ) {
    return this.paymentsService.refund(id, user.id, user.role, reason);
  }

  @Get('earnings/me')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get financial summary & earnings breakdown for current user' })
  async getMyEarnings(@CurrentUser() user: AuthenticatedUser) {
    return this.ledgerService.getUserFinancialSummary(user.id);
  }
}
