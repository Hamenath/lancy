# Lancy Immutable Append-Only Audit Trail

## 1. AuditLog Entity Specification
```prisma
model AuditLog {
  id         String   @id @default(uuid())
  actorId    String
  action     String   // USER_SUSPENDED | USER_RESTORED | PROJECT_HIDDEN | DISPUTE_RESOLVED | REPORT_RESOLVED
  entityType String
  entityId   String
  metadata   String?
  createdAt  DateTime @default(now())
}
```

## 2. Immutability Guarantee
`AuditLog` records are strictly append-only. Modifying or deleting audit log records is prohibited by backend service design. No `DELETE` endpoint exists.
