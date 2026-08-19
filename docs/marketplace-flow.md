# Lancy End-to-End Core Marketplace Flow Guide

```
CLIENT
  │
  │ 1. POST /api/v1/projects
  ↓
PROJECT (DRAFT / OPEN)
  │
  │ 2. Public Marketplace Listing (GET /api/v1/projects)
  ↓
FREELANCERS
  │
  │ 3. View Details (GET /api/v1/projects/:id)
  ↓
PROJECT DETAILS
  │
  │ 4. Submit Bid (POST /api/v1/projects/:id/proposals)
  ↓
PROPOSAL (PENDING)
  │
  │ 5. Client Reviews Bids (GET /api/v1/projects/:id/proposals)
  ↓
CLIENT ACTION
  ├── Shortlist (POST /api/v1/proposals/:id/shortlist)
  ├── Reject (POST /api/v1/proposals/:id/reject)
  └── ACCEPT (POST /api/v1/proposals/:id/accept)
        │
        ↓
ATOMIC TRANSACTION
  ├── Target Proposal -> ACCEPTED
  ├── Project -> IN_PROGRESS
  └── Other Pending Proposals -> REJECTED
```

## Security & Concurrency Enforcement
1. **No Client-Provided Owner IDs**: `clientId` and `freelancerId` are extracted directly from `req.user.id`.
2. **Duplicate Proposal Rejection**: Submitting multiple active bids for the same project returns `409 Conflict`.
3. **Atomic Acceptance**: Prevents race conditions or dual acceptances by executing the status updates inside a Prisma database transaction (`$transaction`).
