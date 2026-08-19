# Lancy Review Moderation & Reporting Guide

## 1. Review Report Entity Specification
```prisma
model ReviewReport {
  id          String   @id @default(uuid())
  reviewId    String
  reporterId  String
  reason      String   // SPAM | HARASSMENT | OFFENSIVE | FAKE_REVIEW | PERSONAL_INFORMATION | OTHER
  description String?
  status      String   @default("PENDING") // PENDING | RESOLVED | DISMISSED
  createdAt   DateTime @default(now())

  @@unique([reviewId, reporterId])
}
```

## 2. Moderation Workflow
1. User reports review via `POST /api/v1/reviews/:id/report`.
2. Rejection of duplicate reports by same user via `@@unique([reviewId, reporterId])`.
3. Admin moderates status via `PATCH /api/v1/admin/reviews/:id/status` (`status: HIDDEN` or `REMOVED`).
