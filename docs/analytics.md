# Lancy Analytics & Marketplace Reporting Architecture

## 1. Analytics REST Endpoints
- `POST /api/v1/analytics/events`: Track lightweight user action.
- `GET /api/v1/analytics/freelancer`: Session-authorized freelancer metrics & earnings time-series.
- `GET /api/v1/analytics/client`: Session-authorized client spending & project fill rate.
- `GET /api/v1/admin/analytics/overview`: Admin platform overview (GMV, Platform Revenue, growth time-series).
- `GET /api/v1/admin/analytics/export?type=revenue|users|projects`: Export CSV report.

## 2. Source-of-Truth Financial Alignment
- **Gross Marketplace Volume (GMV)**: Calculated strictly from succeeded `Payment` records.
- **Platform Revenue**: Derived from Phase 7 `PLATFORM_FEE` ledger entries.
- **Freelancer Earnings / Client Spending**: Calculated directly from Phase 7 `LedgerEntry` tables.
