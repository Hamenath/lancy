# Lancy Role-Based Access Control (RBAC) Architecture

## 1. Role Hierarchy
- `USER` (`FREELANCER` / `CLIENT`): Standard marketplace access.
- `ADMIN`: Platform moderation, user suspension, dispute resolution, audit inspection.

## 2. Server-Side Guard Enforcement
All privileged endpoints are strictly protected by `@UseGuards(FirebaseAuthGuard, RolesGuard)` and `@Roles('ADMIN')`.
Frontend route guards provide UI navigation convenience, but the backend is the sole authority for role validation and resource ownership.
