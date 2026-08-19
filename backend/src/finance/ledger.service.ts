import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { FeeService } from './fee.service';

export interface CreatePaymentLedgerDto {
  paymentId: string;
  contractId: string;
  milestoneId: string;
  clientId: string;
  freelancerId: string;
  amount: number; // Integer minor units
  currency: string;
}

@Injectable()
export class LedgerService {
  constructor(
    private prisma: PrismaService,
    private feeService: FeeService,
  ) {}

  /**
   * Creates immutable double-entry ledger entries for a successful payment:
   * 1. CLIENT -> DEBIT total amount (CLIENT_PAYMENT)
   * 2. PLATFORM -> CREDIT platform fee (PLATFORM_FEE)
   * 3. FREELANCER -> CREDIT net amount (FREELANCER_EARNING)
   */
  async recordSuccessfulPayment(dto: CreatePaymentLedgerDto) {
    const feeBreakdown = this.feeService.calculateFee(dto.amount);

    return this.prisma.$transaction([
      // Client DEBIT
      this.prisma.ledgerEntry.create({
        data: {
          userId: dto.clientId,
          paymentId: dto.paymentId,
          contractId: dto.contractId,
          milestoneId: dto.milestoneId,
          type: 'CLIENT_PAYMENT',
          amount: dto.amount,
          currency: dto.currency,
          direction: 'DEBIT',
          metadata: JSON.stringify({ milestoneId: dto.milestoneId }),
        },
      }),
      // Freelancer CREDIT
      this.prisma.ledgerEntry.create({
        data: {
          userId: dto.freelancerId,
          paymentId: dto.paymentId,
          contractId: dto.contractId,
          milestoneId: dto.milestoneId,
          type: 'FREELANCER_EARNING',
          amount: feeBreakdown.freelancerEarning,
          currency: dto.currency,
          direction: 'CREDIT',
          metadata: JSON.stringify({ feeAmount: feeBreakdown.platformFee }),
        },
      }),
    ]);
  }

  /**
   * Creates correcting ledger entries for a refund:
   * FREELANCER -> DEBIT refunded amount
   * CLIENT -> CREDIT refunded amount
   */
  async recordRefund(paymentId: string, clientId: string, freelancerId: string, refundAmount: number, currency: string) {
    return this.prisma.$transaction([
      this.prisma.ledgerEntry.create({
        data: {
          userId: freelancerId,
          paymentId,
          type: 'REFUND',
          amount: refundAmount,
          currency,
          direction: 'DEBIT',
        },
      }),
      this.prisma.ledgerEntry.create({
        data: {
          userId: clientId,
          paymentId,
          type: 'REFUND',
          amount: refundAmount,
          currency,
          direction: 'CREDIT',
        },
      }),
    ]);
  }

  async getUserFinancialSummary(userId: string) {
    const entries = await this.prisma.ledgerEntry.findMany({
      where: { userId },
    });

    let totalEarned = 0;
    let totalSpent = 0;
    let totalRefunded = 0;

    for (const entry of entries) {
      if (entry.type === 'FREELANCER_EARNING' && entry.direction === 'CREDIT') {
        totalEarned += entry.amount;
      } else if (entry.type === 'CLIENT_PAYMENT' && entry.direction === 'DEBIT') {
        totalSpent += entry.amount;
      } else if (entry.type === 'REFUND') {
        totalRefunded += entry.amount;
      }
    }

    return {
      userId,
      totalEarned,        // Integer minor units
      totalSpent,         // Integer minor units
      totalRefunded,      // Integer minor units
      currency: 'USD',
      formattedTotalEarned: `$${(totalEarned / 100).toFixed(2)}`,
      formattedTotalSpent: `$${(totalSpent / 100).toFixed(2)}`,
      formattedTotalRefunded: `$${(totalRefunded / 100).toFixed(2)}`,
    };
  }
}
