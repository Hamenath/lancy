# Lancy Complete Production Architecture

```
                     INTERNET
                         │
                         ▼
                    CDN / DNS
                         │
                         ▼
                  LOAD BALANCER
                         │
              ┌──────────┴──────────┐
              │                     │
           FRONTEND              BACKEND
        (React/Vite)         (NestJS/Prisma)
              │                     │
              │              ┌──────┼────────┐
              │              │      │        │
              │           AUTH   API      JOBS
              │                     │        │
              │              ┌──────┼────────┤
              │              │      │        │
              │           SQLITE/   CACHE   STORAGE
              │          POSTGRES   (In-Mem)
              │              │
              │        ┌─────┴──────┐
              │        │            │
              │     PAYMENTS       AI
              │   (Ledger Cents) (Provider Abstraction)
              │
              └──────────────┬──────────────
                             │
                       OBSERVABILITY
                             │
                ┌────────────┼────────────┐
                │            │            │
             LOGS          METRICS      ERRORS
        (Correlation ID) (/health)  (Global Filter)
```

## System Modules
- **Authentication**: Firebase Auth + NestJS Guards.
- **Projects & Proposals**: Marketplace bidding transaction pipeline.
- **Contracts & Milestones**: Milestone submission & auto-completion logic.
- **Messaging**: Socket.IO WebSockets + REST history.
- **Payments**: Immutable double-entry minor-unit ledger (`LedgerEntry`).
- **Reviews**: Legitimate completed contract ratings.
- **Search**: PostgreSQL / SQLite native relevance ranking.
- **Trust & Safety**: RBAC admin panel, project reports, disputes, append-only `AuditLog`.
- **Analytics**: Aggregated platform metrics, time-series, CSV exports.
- **AI Layer**: Provider-independent matching, skill extraction, proposal assistant.
- **DevOps**: Docker, `x-request-id` middleware, `/health` probes, GitHub Actions CI.
