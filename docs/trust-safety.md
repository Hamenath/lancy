# Lancy Trust & Safety Architecture

## 1. Account Statuses & Suspension
- `ACTIVE`: Standard platform access.
- `SUSPENDED`: Account suspended due to policy violations. Suspended users are blocked by authentication guards from creating projects, submitting proposals, or initiating contracts.
- `BANNED`: Account permanently terminated.

## 2. Moderation Audit Trail
Every suspension, restoration, project hiding, or dispute resolution generates a corresponding `AuditLog` entry detailing the admin actor, target entity, reason, and timestamp.
