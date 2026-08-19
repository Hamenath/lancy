import { 
  Injectable, 
  NotFoundException, 
  ForbiddenException, 
  BadRequestException, 
  ConflictException 
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { StripeMockPaymentProvider } from './providers/stripe-mock-payment.provider';
import { LedgerService } from '../finance/ledger.service';
import { NotificationsService } from '../notifications/notifications.service';

export interface InitiatePaymentDto {
  milestoneId: string;
}

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private paymentProvider: StripeMockPaymentProvider,
    private ledgerService: LedgerService,
    private notificationsService: NotificationsService,
  ) {}

  async initiatePayment(userId: string, userRole: string, dto: InitiatePaymentDto) {
    const milestone = await this.prisma.milestone.findUnique({
      where: { id: dto.milestoneId },
      include: {
        contract: {
          include: {
            client: true,
            freelancer: true,
          },
        },
      },
    });

    if (!milestone) {
      throw new NotFoundException(`Milestone with ID ${dto.milestoneId} not found`);
    }

    if (milestone.contract.clientId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('Only the contract client can pay for this milestone');
    }

    if (milestone.status !== 'APPROVED') {
      throw new BadRequestException(`Milestone must be APPROVED before payment. Current status: ${milestone.status}`);
    }

    if (milestone.paymentStatus === 'PAID') {
      throw new ConflictException('Milestone has already been paid');
    }

    // Derive server-authoritative integer minor units (e.g. $100.00 -> 10000 cents)
    const expectedAmountMinor = Math.round(milestone.amount * 100);
    const currency = milestone.contract.currency || 'USD';

    // Call payment provider abstraction
    const intentResult = await this.paymentProvider.createPaymentIntent(expectedAmountMinor, currency, {
      milestoneId: milestone.id,
      contractId: milestone.contractId,
      clientId: userId,
    });

    // Save payment record
    const payment = await this.prisma.payment.create({
      data: {
        contractId: milestone.contractId,
        milestoneId: milestone.id,
        payerId: userId,
        amount: expectedAmountMinor,
        currency,
        provider: 'STRIPE_MOCK',
        providerPaymentId: intentResult.providerPaymentId,
        status: 'PROCESSING',
      },
    });

    // Update milestone payment status
    await this.prisma.milestone.update({
      where: { id: milestone.id },
      data: { paymentStatus: 'PAYMENT_PENDING' },
    });

    return {
      payment,
      clientSecret: intentResult.clientSecret,
    };
  }

  async handleWebhook(headers: Record<string, any>, rawBody: any) {
    // 1. Verify webhook signature
    const verifyResult = await this.paymentProvider.verifyWebhook(headers, rawBody);
    if (!verifyResult.isValid || !verifyResult.providerEventId) {
      throw new BadRequestException('Invalid webhook signature');
    }

    // 2. Check idempotency (prevent duplicate webhook processing)
    const existingEvent = await this.prisma.webhookEvent.findUnique({
      where: { providerEventId: verifyResult.providerEventId },
    });

    if (existingEvent) {
      return { status: 'already_processed', providerEventId: verifyResult.providerEventId };
    }

    // 3. Save WebhookEvent for idempotency
    await this.prisma.webhookEvent.create({
      data: {
        provider: 'STRIPE_MOCK',
        providerEventId: verifyResult.providerEventId,
        eventType: verifyResult.eventType || 'payment_intent.succeeded',
      },
    });

    // 4. Process payment state update
    if (verifyResult.providerPaymentId) {
      const payment = await this.prisma.payment.findUnique({
        where: { providerPaymentId: verifyResult.providerPaymentId },
        include: { contract: true, milestone: true },
      });

      if (payment && payment.status !== 'SUCCEEDED') {
        // Execute atomic status & ledger updates
        await this.prisma.$transaction([
          this.prisma.payment.update({
            where: { id: payment.id },
            data: { status: 'SUCCEEDED' },
          }),
          this.prisma.milestone.update({
            where: { id: payment.milestoneId },
            data: { paymentStatus: 'PAID' },
          }),
        ]);

        // Record double-entry ledger entries
        await this.ledgerService.recordSuccessfulPayment({
          paymentId: payment.id,
          contractId: payment.contractId,
          milestoneId: payment.milestoneId,
          clientId: payment.payerId,
          freelancerId: payment.contract.freelancerId,
          amount: payment.amount,
          currency: payment.currency,
        });

        // Trigger Notification to Freelancer & Client
        await this.notificationsService.createNotification({
          userId: payment.contract.freelancerId,
          type: 'PAYMENT_RECEIVED',
          title: 'Payment Received!',
          message: `Payment of $${(payment.amount / 100).toFixed(2)} received for milestone "${payment.milestone.title}"`,
          metadata: { contractId: payment.contractId, milestoneId: payment.milestoneId },
        });
      }
    }

    return { status: 'success', providerEventId: verifyResult.providerEventId };
  }

  async getMyPayments(userId: string) {
    return this.prisma.payment.findMany({
      where: {
        OR: [
          { payerId: userId },
          { contract: { freelancerId: userId } },
        ],
      },
      include: {
        contract: true,
        milestone: true,
        ledgerEntries: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string, userRole: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: {
        contract: true,
        milestone: true,
        ledgerEntries: true,
      },
    });

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    const isPayer = payment.payerId === userId;
    const isFreelancer = payment.contract.freelancerId === userId;
    const isAdmin = userRole === 'ADMIN';

    if (!isPayer && !isFreelancer && !isAdmin) {
      throw new ForbiddenException('You are not authorized to view this payment');
    }

    return payment;
  }

  async refund(id: string, userId: string, userRole: string, reason?: string) {
    const payment = await this.findOne(id, userId, userRole);

    if (payment.status !== 'SUCCEEDED') {
      throw new BadRequestException(`Cannot refund payment in status ${payment.status}`);
    }

    if (!payment.providerPaymentId) {
      throw new BadRequestException('Payment provider reference missing');
    }

    // Call provider refund
    const refundResult = await this.paymentProvider.refundPayment(payment.providerPaymentId, payment.amount, reason);

    // Create refund record & update payment status
    await this.prisma.$transaction([
      this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'REFUNDED' },
      }),
      this.prisma.refund.create({
        data: {
          paymentId: payment.id,
          amount: payment.amount,
          reason: reason || 'Client refund request',
          providerRefundId: refundResult.providerRefundId,
          status: 'COMPLETED',
        },
      }),
    ]);

    // Record correcting ledger entry
    await this.ledgerService.recordRefund(
      payment.id,
      payment.payerId,
      payment.contract.freelancerId,
      payment.amount,
      payment.currency,
    );

    return { status: 'refunded', amount: payment.amount };
  }
}
