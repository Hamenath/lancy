# Lancy Immutable Double-Entry Financial Ledger

## 1. Immutable Ledger Specification
```prisma
model LedgerEntry {
  id          String   @id @default(uuid())
  userId      String
  paymentId   String?
  contractId  String?
  milestoneId String?
  type        String   // CLIENT_PAYMENT | PLATFORM_FEE | FREELANCER_EARNING | REFUND | ADJUSTMENT
  amount      Int      // Integer minor units
  currency    String   @default("USD")
  direction   String   // CREDIT | DEBIT
  metadata    String?
  createdAt   DateTime @default(now())
}
```

## 2. Double-Entry Accounting Model
For a $100.00 (`10000` cents) milestone payment with 10% platform fee:
- Client `CLIENT_PAYMENT` DEBIT: `10000` cents
- Platform `PLATFORM_FEE` CREDIT: `1000` cents
- Freelancer `FREELANCER_EARNING` CREDIT: `9000` cents

Ledger history is strictly immutable. Refund or correction events append new correcting ledger entries without altering past rows.
