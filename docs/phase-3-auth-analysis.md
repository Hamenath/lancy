# Lancy Phase 3: Authentication & Authorization Security Audit

## 1. Current Authentication Flow
- **Provider**: Firebase Authentication (`firebase/auth`) in `src/context/AuthContext.tsx`.
- **Flow**: User logs in with Email/Password or Google OAuth on `src/pages/Login.tsx` / `src/pages/Register.tsx`.
- **Client Session**: Managed by Firebase client SDK in `onAuthStateChanged`.
- **Route Guarding**: `src/components/ProtectedRoute.tsx` checks if `useAuth().user` is present in local React state.

## 2. Current User Model & Database State
- **Firebase User**: Contains `uid`, `email`, `displayName`, `photoURL`.
- **Firestore Document**: Stores user metadata (`name`, `specialty`, `skills`, `rate`, `location`, `isVerified`).
- **PostgreSQL User Entity (Phase 2)**: `User` model with `id`, `email`, `name`, `role`, `firebaseUid`, and `FreelancerProfile`.

## 3. Existing Security Vulnerabilities Identified
1. **Unverified API Requests**: API endpoints currently do not validate `Authorization: Bearer <token>` headers.
2. **Client-Driven Role Selection**: Role assignment is vulnerable to client-side manipulation if `role` is submitted directly from unauthenticated request bodies.
3. **Missing Ownership Verification (IDOR)**: Endpoints accept `clientId` or `freelancerId` from request bodies without verifying that the requesting user actually owns the resource.
4. **Lack of Account Status Enforcement**: No account status (`ACTIVE`, `SUSPENDED`, `DEACTIVATED`) checks exist to block suspended users from interacting with the marketplace.

## 4. Phase 3 Architecture & Migration Plan
- **Backend-Driven Authority**: NestJS API becomes the sole authority for identity resolution, roles, and ownership enforcement.
- **Firebase Bearer Token Verification**: `FirebaseAuthGuard` validates incoming Firebase ID tokens, extracts `firebaseUid`, and attaches the canonical `User` entity to the request context.
- **Role-Based Access Control (RBAC)**: `@Roles(Role.CLIENT, Role.FREELANCER, Role.ADMIN)` enforced via `RolesGuard`.
- **Resource Ownership Guards**: Server verifies `req.user.id === resource.ownerId` before permitting mutations.
- **Frontend Token Injection**: `apiConfig.ts` automatically attaches `Authorization: Bearer <idToken>` on all API calls.
- **Auth Endpoint**: `GET /api/v1/auth/me` returns the authoritative user identity and role from PostgreSQL.
