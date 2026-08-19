# Lancy Phase 5: Contracts, Milestones & Work Management Analysis

## 1. Executive Summary
Phase 5 introduces the post-acceptance work management layer:
```
Client Accepts Proposal -> Contract Created (Prisma Transaction) -> Milestones Defined & Ordered -> Freelancer Starts/Submits Milestone -> Client Approves/Requests Changes -> All Milestones Approved -> Contract & Project Automatically Marked COMPLETED
```

## 2. Existing Data Model & Gap Analysis
- **Current Proposal Acceptance (Phase 4)**: Proposal status set to `ACCEPTED`, project set to `IN_PROGRESS`, other pending proposals set to `REJECTED`.
- **Gaps Identified**:
  1. No `Contract` model linking Project, Accepted Proposal, Client, and Freelancer.
  2. No `Milestone` model to track deliverables, budget allocation, due dates, or client approval workflow.
  3. Proposal acceptance transaction needs to automatically generate the single active `Contract`.
  4. Milestone total amount validation (sum of milestones <= contract agreed amount) needs server-side enforcement.
  5. Completion logic: Contract and Project must transition to `COMPLETED` automatically when all milestones are `APPROVED`.

## 3. Core Domain Entities Specification
### `Contract` Model
- `id`, `projectId` (unique), `proposalId` (unique), `clientId`, `freelancerId`, `title`, `description`, `agreedAmount`, `currency`, `startDate`, `expectedEndDate`, `status` (`DRAFT`, `ACTIVE`, `PAUSED`, `COMPLETED`, `CANCELLED`), `createdAt`, `updatedAt`.

### `Milestone` Model
- `id`, `contractId`, `title`, `description`, `amount`, `dueDate`, `order`, `status` (`PENDING`, `IN_PROGRESS`, `SUBMITTED`, `CHANGES_REQUESTED`, `APPROVED`, `CANCELLED`), `submittedAt`, `approvedAt`, `changeReason`, `createdAt`, `updatedAt`.

## 4. Key Security & Transactional Directives
1. **Single Contract Guarantee**: Uniqueness on `projectId` and `proposalId` prevents duplicate active contracts.
2. **Server-Enforced Milestone Budget Limit**: Server rejects milestone creation if cumulative `sum(milestone.amount) > contract.agreedAmount`.
3. **Server-Derived Ownership**: `clientId` / `freelancerId` derived from authenticated user token context.
4. **State Transition Rules**: Strict state machine guards block impossible status transitions (e.g. `APPROVED` -> `PENDING`).
