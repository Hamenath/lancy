# Lancy Milestone Domain & State Machine Guide

## 1. Milestone Entity Specification
```prisma
model Milestone {
  id           String    @id @default(uuid())
  contractId   String
  title        String
  description  String
  amount       Float
  dueDate      DateTime?
  order        Int       @default(1)
  status       String    @default("PENDING") // PENDING | IN_PROGRESS | SUBMITTED | CHANGES_REQUESTED | APPROVED | CANCELLED
  submittedAt  DateTime?
  approvedAt   DateTime?
  changeReason String?
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
}
```

## 2. Milestone State Machine & Rules
```
PENDING -> IN_PROGRESS (Freelancer Starts) -> SUBMITTED (Freelancer Submits Work) -> APPROVED (Client Approves) or CHANGES_REQUESTED (Client Requests Changes with reason)
```
- **Cumulative Amount Enforcement**: `sum(milestones) <= contract.agreedAmount`. Rejects creation if milestone amounts exceed agreed budget.
- **Automatic Contract Completion**: Approving the final remaining milestone automatically marks Contract `COMPLETED` and Project `COMPLETED` in a single Prisma transaction.
