# Lancy Phase 11: Analytics, Reporting & Marketplace Intelligence Analysis

## 1. Executive Summary
Phase 11 delivers a production-ready analytics engine for Lancy. Analytics calculations are separated into dedicated NestJS aggregation services and derive strictly from real database records (Prisma & Phase 7/8/9 sources of truth).

```
Marketplace Activity / User Actions -> AnalyticsEvent / DB Source of Truth -> AnalyticsService Aggregation -> Time-Series & Metrics REST API -> Freelancer, Client & Admin Dashboards
```

## 2. Core Architectural & Privacy Principles
1. **Source of Truth Integrity**: Financial metrics (GMV, Earnings, Spending, Platform Revenue) pull directly from Phase 7 `Payment` and `LedgerEntry` tables. Reputation metrics pull directly from Phase 8 `Review` records. Search analytics pull from Phase 9 query logs.
2. **Data Minimization & Privacy**: `AnalyticsEvent` records never store passwords, auth tokens, CVVs, private messages, or raw card data.
3. **Strict Authorization**: User identity is derived from authenticated session tokens. Freelancers/Clients can access ONLY their own analytics. Admins access platform-wide analytics and CSV export capability.
4. **Zero-Data Safety**: Empty states return explicit zeros (`0`) or empty time-series arrays. Metric fabrication is strictly forbidden.

## 3. Data Model Specification (`schema.prisma`)
- **`AnalyticsEvent`**: `id`, `eventType` (`PROFILE_VIEWED`, `PROJECT_VIEWED`, `PROPOSAL_SUBMITTED`, `PROPOSAL_ACCEPTED`, `CONTRACT_CREATED`, `CONTRACT_COMPLETED`, `SEARCH_PERFORMED`), `actorId`, `entityType`, `entityId`, `metadata`, `createdAt`.
