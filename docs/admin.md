# Lancy Admin Dashboard & Platform Controls

## 1. Dashboard Aggregations (`GET /api/v1/admin/dashboard/stats`)
- `totalUsers`
- `activeFreelancers`
- `activeClients`
- `activeProjects`
- `activeContracts`
- `completedContracts`
- `openReports`
- `openDisputes`
- `totalVolumeMinor` / `formattedTotalVolume`

## 2. Admin REST Endpoints
- `GET /api/v1/admin/users`: User management & status controls.
- `POST /api/v1/admin/users/:id/suspend`: Suspend user account with reason.
- `POST /api/v1/admin/users/:id/restore`: Restore user account.
- `GET /api/v1/admin/projects`: Project listing moderation.
- `PATCH /api/v1/admin/projects/:id/status`: Update project status (`HIDDEN`, `ACTIVE`).
- `GET /api/v1/admin/reports`: List project & review reports.
- `GET /api/v1/admin/disputes` & `POST /api/v1/admin/disputes/:id/resolve`: Marketplace disputes handling.
- `GET /api/v1/admin/payments`: Read-only financial volume monitoring.
- `GET /api/v1/admin/audit-logs`: Append-only audit logs.
