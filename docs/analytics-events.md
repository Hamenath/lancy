# Lancy Analytics Event Model & Privacy Rules

## 1. AnalyticsEvent Schema
```prisma
model AnalyticsEvent {
  id         String   @id @default(uuid())
  eventType  String   // PROFILE_VIEWED | PROJECT_VIEWED | PROPOSAL_SUBMITTED | PROPOSAL_ACCEPTED | CONTRACT_COMPLETED | SEARCH_PERFORMED
  actorId    String?
  entityType String?
  entityId   String?
  metadata   String?
  createdAt  DateTime @default(now())
}
```

## 2. Privacy & Data Minimization Directives
- Passwords, authentication tokens, payment credentials, CVVs, or private message texts are NEVER recorded in event metadata.
- Event tracking is lightweight and focused strictly on marketplace interaction signals.
