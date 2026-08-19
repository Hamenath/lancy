# Lancy Phase 7: Payments, Transaction Ledger & Financial Infrastructure Analysis

## 1. Executive Summary
Phase 7 implements Lancy's financial infrastructure with server-authoritative payment processing, webhook signature verification, webhook event idempotency, an immutable double-entry ledger, platform fee calculations, and earnings reporting.

```
Client Approves Milestone -> POST /api/v1/payments (Amount derived from DB) -> Payment Provider (Stripe/Mock Abstraction) -> Webhook Signature & Idempotency Check -> Immutable Ledger Entry Created -> Freelancer Earnings Credited
```

## 2. Core Architectural & Financial Directives
1. **Server-Authoritative Authority**: The database relationships (`Milestone`, `Contract`) define expected payable amounts. Client-provided amounts/currencies are validated against database records and rejected if mismatched.
2. **Integer Minor Units**: Financial amounts are stored strictly as integer minor units (e.g. $500.00 = `50000` cents). Floating-point math is prohibited for financial logic.
3. **Immutable Double-Entry Ledger**: `LedgerEntry` records (`CLIENT_PAYMENT`, `PLATFORM_FEE`, `FREELANCER_EARNING`, `REFUND`) with direction (`CREDIT` / `DEBIT`) are immutable. Corrections require new entry rows.
4. **Webhook Idempotency**: `WebhookEvent` table tracks processed provider event IDs with a unique constraint on `providerEventId` to prevent duplicate ledger entries or double earnings.
5. **No PCI Card Storage**: Card numbers, CVV, and raw credentials are never accepted or stored by Lancy. Provider-hosted interfaces and tokenized transaction IDs are used exclusively.

## 3. Financial Domain Models Overview
- **`Payment`**: `id`, `contractId`, `milestoneId`, `payerId`, `amount` (integer minor units), `currency`, `provider`, `providerPaymentId`, `status`, `createdAt`, `updatedAt`.
- **`WebhookEvent`**: `id`, `provider`, `providerEventId` (unique), `eventType`, `processedAt`, `createdAt`.
- **`LedgerEntry`**: `id`, `userId`, `paymentId`, `contractId`, `milestoneId`, `type`, `amount`, `currency`, `direction`, `metadata`, `createdAt`.
- **`Refund`**: `id`, `paymentId`, `amount`, `reason`, `providerRefundId`, `status`, `createdAt`.
