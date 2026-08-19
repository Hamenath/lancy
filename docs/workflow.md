# Lancy Complete Post-Acceptance Work Execution Guide

```
CLIENT
  │
  │ Accepts Proposal (POST /api/v1/proposals/:id/accept)
  ↓
PRISMA $TRANSACTION
  ├── Proposal -> ACCEPTED
  ├── Project -> IN_PROGRESS
  ├── Other Pending Proposals -> REJECTED
  └── CONTRACT CREATED (ACTIVE)
        │
        ↓
MILESTONES CREATION (POST /api/v1/contracts/:contractId/milestones)
  │ Server verifies sum(milestones) <= contract.agreedAmount
  ↓
FREELANCER EXECUTION
  ├── Start Work (POST /api/v1/milestones/:id/start) -> IN_PROGRESS
  └── Submit Work (POST /api/v1/milestones/:id/submit) -> SUBMITTED
        │
        ↓
CLIENT REVIEW
  ├── Request Changes (POST /api/v1/milestones/:id/request-changes) -> CHANGES_REQUESTED
  └── Approve Milestone (POST /api/v1/milestones/:id/approve) -> APPROVED
        │
        ↓
IF ALL MILESTONES APPROVED
  ├── Contract -> COMPLETED
  └── Project -> COMPLETED
```
