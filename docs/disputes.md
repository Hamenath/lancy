# Lancy Contract Dispute System

## 1. Dispute Entity Specification
```prisma
model Dispute {
  id           String    @id @default(uuid())
  contractId   String
  openedById   String
  reason       String
  description  String
  status       String    @default("OPEN") // OPEN | UNDER_REVIEW | WAITING_FOR_RESPONSE | RESOLVED | CLOSED
  resolution   String?
  resolvedById String?
  resolvedAt   DateTime?
  createdAt    DateTime  @default(now())
}
```

## 2. Dispute Lifecycle & Financial Directives
1. Contract participants open a dispute via `POST /api/v1/contracts/:id/disputes`.
2. Admin reviews contract milestones, payments, and messages via `GET /api/v1/disputes/:id`.
3. Admin resolves dispute via `POST /api/v1/admin/disputes/:id/resolve`.
4. Financial adjustments or refunds must use Phase 7 payment services. Direct mutation of ledger history is forbidden.
