# Lancy Production Deployment Checklist

## Security & Auth
- [x] Server-authoritative RBAC guard verification on all endpoints.
- [x] Standardized exception filter preventing stack trace leakage.
- [x] CORS origin validation using `CORS_ORIGINS`.
- [x] Helmet security HTTP headers.

## Data & Database
- [x] Database indexes on high-frequency search & foreign keys.
- [x] Immutable double-entry financial ledger math using minor units (cents).
- [x] Automated Prisma schema migrations up to date.

## DevOps & Infrastructure
- [x] Multi-stage non-root container `Dockerfile`.
- [x] Health (`/health`), Readiness (`/ready`), Liveness (`/live`) probes active.
- [x] GitHub Actions CI pipeline executing lint, build, and test steps.
