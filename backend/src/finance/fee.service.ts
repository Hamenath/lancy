import { Injectable } from '@nestjs/common';

export interface FeeBreakdown {
  totalAmount: number;     // Integer minor units
  platformFee: number;     // Integer minor units
  freelancerEarning: number; // Integer minor units
  feePercentage: number;
}

@Injectable()
export class FeeService {
  // Default platform fee: 10% (1000 basis points)
  private readonly DEFAULT_FEE_BPS = 1000;

  calculateFee(amount: number, feeBasisPoints = this.DEFAULT_FEE_BPS): FeeBreakdown {
    // Integer minor unit calculation: Math.floor((amount * bps) / 10000)
    const platformFee = Math.floor((amount * feeBasisPoints) / 10000);
    const freelancerEarning = amount - platformFee;

    return {
      totalAmount: amount,
      platformFee,
      freelancerEarning,
      feePercentage: feeBasisPoints / 100,
    };
  }
}
