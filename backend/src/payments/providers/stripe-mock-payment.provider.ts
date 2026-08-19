import { Injectable } from '@nestjs/common';
import { PaymentProvider, CreatePaymentIntentResult, VerifyWebhookResult, RefundResult } from './payment-provider.interface';

@Injectable()
export class StripeMockPaymentProvider implements PaymentProvider {
  async createPaymentIntent(amount: number, currency: string, metadata: Record<string, any>): Promise<CreatePaymentIntentResult> {
    const providerPaymentId = `pi_mock_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const clientSecret = `${providerPaymentId}_secret_${Math.random().toString(36).substring(2, 8)}`;
    
    return {
      providerPaymentId,
      clientSecret,
      status: 'requires_payment_method',
    };
  }

  async verifyWebhook(headers: Record<string, any>, rawBody: any): Promise<VerifyWebhookResult> {
    const eventId = headers['x-mock-event-id'] || `evt_mock_${Date.now()}`;
    const eventType = headers['x-mock-event-type'] || 'payment_intent.succeeded';
    
    let bodyObj = rawBody;
    if (typeof rawBody === 'string') {
      try { bodyObj = JSON.parse(rawBody); } catch (e) {}
    }

    return {
      isValid: true,
      providerEventId: eventId,
      eventType: bodyObj?.type || eventType,
      providerPaymentId: bodyObj?.data?.object?.id || bodyObj?.providerPaymentId,
      amount: bodyObj?.data?.object?.amount || bodyObj?.amount,
      currency: bodyObj?.data?.object?.currency || bodyObj?.currency || 'USD',
    };
  }

  async refundPayment(providerPaymentId: string, amount: number, reason?: string): Promise<RefundResult> {
    return {
      providerRefundId: `re_mock_${Date.now()}`,
      status: 'succeeded',
      amount,
    };
  }
}
