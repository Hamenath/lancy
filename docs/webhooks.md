# Lancy Webhook Signature Verification & Idempotency Guide

## 1. Webhook Event Specification
```prisma
model WebhookEvent {
  id              String   @id @default(uuid())
  provider        String
  providerEventId String   @unique
  eventType       String
  processedAt     DateTime @default(now())
  createdAt       DateTime @default(now())
}
```

## 2. Idempotency Flow
1. Receive incoming webhook request on `POST /api/v1/payments/webhook`.
2. Verify provider signature using `PaymentProvider.verifyWebhook()`.
3. Check database for existing `providerEventId`.
4. If found, return `200 OK` (`status: already_processed`).
5. If new, save `WebhookEvent` and execute status & ledger update in a single atomic database transaction.
