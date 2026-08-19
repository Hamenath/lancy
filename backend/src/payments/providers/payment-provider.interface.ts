export interface CreatePaymentIntentResult {
  providerPaymentId: string;
  clientSecret: string;
  status: string;
}

export interface VerifyWebhookResult {
  isValid: boolean;
  providerEventId?: string;
  eventType?: string;
  providerPaymentId?: string;
  amount?: number;
  currency?: string;
}

export interface RefundResult {
  providerRefundId: string;
  status: string;
  amount: number;
}

export interface PaymentProvider {
  createPaymentIntent(amount: number, currency: string, metadata: Record<string, any>): Promise<CreatePaymentIntentResult>;
  verifyWebhook(headers: Record<string, any>, rawBody: string | Buffer): Promise<VerifyWebhookResult>;
  refundPayment(providerPaymentId: string, amount: number, reason?: string): Promise<RefundResult>;
}
