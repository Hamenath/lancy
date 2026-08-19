# Lancy Proposal Domain Specification & Acceptance Guide

## 1. Proposal Entity Specification
```prisma
model Proposal {
  id             String   @id @default(uuid())
  projectId      String
  freelancerId   String
  bidAmount      Float
  proposedBudget Float?
  estimatedDays  Int      @default(7)
  coverLetter    String
  status         String   @default("PENDING") // PENDING | SHORTLISTED | ACCEPTED | REJECTED | WITHDRAWN
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}
```

## 2. API Endpoints & Authorization Rules
- `POST /api/v1/projects/:id/proposals` - Submit proposal bid (`FREELANCER`/`ADMIN`; `freelancerId` derived from auth user).
- `GET /api/v1/projects/:id/proposals` - List project proposals (Project owner / Admin only).
- `GET /api/v1/proposals/me` - List submitted proposals for current freelancer.
- `GET /api/v1/proposals/:id` - Detailed proposal view.
- `PATCH /api/v1/proposals/:id` - Edit proposal bid while `PENDING` (Proposal owner / Admin only).
- `POST /api/v1/proposals/:id/withdraw` - Withdraw proposal (`PENDING`/`SHORTLISTED` -> `WITHDRAWN`).
- `POST /api/v1/proposals/:id/shortlist` - Client shortlists proposal.
- `POST /api/v1/proposals/:id/reject` - Client rejects proposal.
- `POST /api/v1/proposals/:id/accept` - **Atomic Proposal Acceptance Transaction**:
  - Sets accepted proposal to `ACCEPTED`.
  - Sets project status to `IN_PROGRESS`.
  - Sets all other `PENDING` or `SHORTLISTED` proposals for project to `REJECTED`.
