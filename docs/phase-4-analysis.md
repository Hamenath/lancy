# Lancy Phase 4: Projects, Discovery & Proposals Analysis

## 1. Domain Overview
Phase 4 implements the complete core marketplace loop for Lancy:
```
Client Creates & Publishes Project -> Freelancer Discovers -> Freelancer Submits Proposal -> Client Reviews & Accepts -> Proposal ACCEPTED & Project IN_PROGRESS
```

## 2. Existing Data Model & Gap Analysis
- **Current Project Model**: Minimal fields (`title`, `description`, `budget`, `category`, `imageUrl`, `status`, `clientId`).
- **Gaps Identified**:
  1. Missing `projectType` (`FIXED_PRICE`, `HOURLY`).
  2. Missing `experienceLevel` (`BEGINNER`, `INTERMEDIATE`, `EXPERT`).
  3. Missing `deadline`, `currency`, and `skills` tag array.
  4. Project lifecycle status needs explicit states (`DRAFT`, `OPEN`, `PAUSED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`, `CLOSED`).
- **Current Proposal Model**: Minimal fields (`projectId`, `freelancerId`, `bidAmount`, `coverLetter`, `status`).
- **Gaps Identified**:
  1. Missing proposal states (`PENDING`, `SHORTLISTED`, `ACCEPTED`, `REJECTED`, `WITHDRAWN`).
  2. Missing `estimatedDays` and `proposedBudget`.
  3. Missing duplicate proposal prevention per freelancer/project pair.
  4. Missing atomic database transaction for proposal acceptance.

## 3. Core Requirements & Safety Rules
1. **Server-Derived Ownership**:
   - `clientId` for created projects comes from authenticated `req.user.id`.
   - `freelancerId` for proposals comes from authenticated `req.user.id`.
2. **Strict Project Status Validation**:
   - Proposals rejected if project status is not `OPEN`.
   - Project editing restricted to `DRAFT` or `OPEN` states.
3. **Atomic Proposal Acceptance Transaction**:
   - Accepting a proposal atomically sets project status to `IN_PROGRESS`, sets accepted proposal to `ACCEPTED`, and rejects all other pending proposals for that project in a single Prisma `$transaction`.
