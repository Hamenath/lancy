import { apiFetch } from "./apiConfig";
import type { Milestone, Contract } from "./contractService";

export interface PaymentRecord {
  id: string;
  contractId: string;
  milestoneId: string;
  payerId: string;
  amount: number; // Integer minor units (cents)
  currency: string;
  provider: string;
  providerPaymentId?: string;
  status: string; // PENDING | PROCESSING | SUCCEEDED | FAILED | CANCELLED | REFUNDED
  createdAt: string;
  contract?: Contract;
  milestone?: Milestone;
}

export interface InitiatePaymentResult {
  payment: PaymentRecord;
  clientSecret: string;
}

export const paymentService = {
  async initiatePayment(milestoneId: string): Promise<InitiatePaymentResult | null> {
    return apiFetch<InitiatePaymentResult>('/payments', {
      method: 'POST',
      body: JSON.stringify({ milestoneId }),
    });
  },

  async getMyPayments(): Promise<PaymentRecord[]> {
    const res = await apiFetch<PaymentRecord[]>('/payments/me');
    return res || [];
  },

  async getPaymentById(id: string): Promise<PaymentRecord | null> {
    return apiFetch<PaymentRecord>(`/payments/${id}`);
  },

  async refundPayment(id: string, reason?: string): Promise<{ status: string; amount: number } | null> {
    return apiFetch<{ status: string; amount: number }>(`/payments/${id}/refund`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },
};
