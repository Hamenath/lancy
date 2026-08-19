# Lancy Reviews & Eligibility Architecture

## 1. Review Entity Specification
```prisma
model Review {
  id                    String         @id @default(uuid())
  contractId            String
  reviewerId            String
  revieweeId            String
  rating                Int            // 1 to 5
  communicationRating   Int            @default(5)
  qualityRating         Int            @default(5)
  professionalismRating Int            @default(5)
  comment               String
  status                String         @default("PUBLISHED") // PUBLISHED | HIDDEN | FLAGGED | REMOVED
  verified              Boolean        @default(true)
  createdAt             DateTime       @default(now())
  updatedAt             DateTime       @updatedAt

  @@unique([contractId, reviewerId])
}
```

## 2. Review Eligibility Directives
- **Completed Contract Requirement**: Reviews are permitted ONLY when `contract.status === 'COMPLETED'`.
- **Participant Verification**: Reviewer must be either the `clientId` or `freelancerId` of the contract.
- **No Self-Reviews**: Server enforces `reviewerId !== revieweeId`.
- **One Review Per Participant Per Contract**: Enforced via compound unique constraint `@@unique([contractId, reviewerId])`.
- **7-Day Edit Window**: Reviewer can modify review within 7 days of creation (`PATCH /api/v1/reviews/:id`).
