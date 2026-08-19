# Lancy Phase 10: Admin Dashboard, Moderation, Trust & Safety Analysis

## 1. Executive Summary
Phase 10 introduces server-authoritative administrative controls, moderation workflows, dispute resolution mechanisms, and an immutable append-only audit logging system for Lancy.

```
Contract Participant / User -> Report / Dispute -> Server-Side RBAC Verification (@Roles('ADMIN')) -> Admin Resolves / Moderates -> Append-Only AuditLog Created -> Action Notification Pushed
```

## 2. Core Security & RBAC Principles
1. **Server-Authoritative Enforcement**: All admin endpoints enforce `@UseGuards(FirebaseAuthGuard, RolesGuard)` and `@Roles('ADMIN')`. Frontend state or `isAdmin` flags are never trusted.
2. **Append-Only Audit Logging**: Every administrative action (`USER_SUSPENDED`, `USER_RESTORED`, `PROJECT_HIDDEN`, `DISPUTE_RESOLVED`, `REPORT_RESOLVED`) writes an immutable row to `AuditLog`. No `DELETE` endpoint exists for audit logs.
3. **No Direct Ledger Mutation**: Admins cannot rewrite `LedgerEntry` history. Financial adjustments or refunds must use Phase 7 payment services.
4. **Account Status Verification**: Suspended or banned users are blocked by authentication guards from creating projects, submitting proposals, or initiating contracts.

## 3. Data Models Overview (`schema.prisma`)
- **`ProjectReport`**: `id`, `projectId`, `reporterId`, `reason`, `description`, `status` (`OPEN`, `UNDER_REVIEW`, `RESOLVED`, `DISMISSED`), `createdAt`.
- **`Dispute`**: `id`, `contractId`, `openedById`, `reason`, `description`, `status` (`OPEN`, `UNDER_REVIEW`, `RESOLVED`, `CLOSED`), `resolution`, `resolvedById`, `resolvedAt`, `createdAt`.
- **`AuditLog`**: `id`, `actorId`, `action`, `entityType`, `entityId`, `metadata`, `createdAt`.
