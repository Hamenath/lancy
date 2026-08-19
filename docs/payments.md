# Lancy Payment Domain & Provider Architecture

## 1. Payment Entity Specification
```prisma
model Payment {
  id                String        @id @default(uuid())
  contractId        String
  milestoneId       String
  payerId           String
  amount            Int           // Stored as integer minor units (e.g. 10000 cents = $100.00)
  currency          String        @default("USD")
  provider          String        @default("STRIPE")
  providerPaymentId String?       @unique
  status            String        @default("PENDING") // PENDING | PROCESSING | SUCCEEDED | FAILED | CANCELLED | REFUNDED | PARTIALLY_REFUNDED
  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt
}
```

## 2. API Endpoints
- `POST /api/v1/payments` - Initiate payment for approved milestone (Server derives expected amount).
- `GET /api/v1/payments/me` - List user payments.
- `GET /api/v1/payments/:id` - Detailed payment record & ledger breakdown.
- `POST /api/v1/payments/webhook` - Webhook receiver with signature verification and idempotency protection.
- `POST /api/v1/payments/:id/refund` - Process payment refund.
