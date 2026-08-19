# Lancy Authorization & Permission Matrix

## Role-Based Permission Matrix

| Resource / Action | Client | Freelancer | Admin | Ownership Check Required |
| :--- | :---: | :---: | :---: | :---: |
| **GET /api/v1/auth/me** | ✅ | ✅ | ✅ | Yes (Self) |
| **GET /api/v1/freelancers** | ✅ | ✅ | ✅ | No |
| **GET /api/v1/freelancers/:id** | ✅ | ✅ | ✅ | No |
| **PATCH /api/v1/freelancers/:id** | ❌ | ✅ | ✅ | Yes (Must match `freelancer.userId`) |
| **GET /api/v1/projects** | ✅ | ✅ | ✅ | No |
| **POST /api/v1/projects** | ✅ | ❌ | ✅ | Yes (ClientId derived from `req.user.id`) |
| **PATCH /api/v1/projects/:id** | ✅ | ❌ | ✅ | Yes (Must match `project.clientId`) |
| **DELETE /api/v1/projects/:id** | ✅ | ❌ | ✅ | Yes (Must match `project.clientId`) |
| **POST /api/v1/projects/:id/proposals** | ❌ | ✅ | ✅ | Yes (FreelancerId derived from `req.user.id`) |
| **GET /api/v1/projects/:id/proposals** | ✅ | ❌ | ✅ | Yes (Must match `project.clientId`) |
| **PATCH /api/v1/proposals/:id** | ❌ | ✅ | ✅ | Yes (Must match `proposal.freelancerId`) |
| **GET /api/v1/users** | ❌ | ❌ | ✅ | Admin Only |
| **PATCH /api/v1/users/:id/status** | ❌ | ❌ | ✅ | Admin Only (Suspend / Activate) |

## Account Status Rules
- **ACTIVE**: Full marketplace access based on role permissions.
- **SUSPENDED**: Read-only access allowed; write mutations (`POST`, `PATCH`, `DELETE`) rejected with `403 Forbidden`.
- **DEACTIVATED**: All access rejected with `401 Unauthorized`.
