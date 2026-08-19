# Security Policy for Lancy

## Reporting Vulnerabilities
If you discover a security vulnerability within Lancy, please send a responsible disclosure report to the security team. **Do not create public GitHub issues for security vulnerabilities.**

### Disclosure Process
1. Email security report details to `security@lancy-marketplace.org`.
2. Include reproduction steps, sample HTTP payloads, and impact assessment.
3. The security team will acknowledge receipt within 24 hours and issue a triage response within 72 hours.

## Security Controls Overview
- **Authentication**: Firebase Authentication tokens verified server-side on every request.
- **Authorization**: Role-based access control (`@Roles('ADMIN')`) and resource ownership verification on all entity endpoints.
- **Rate Limiting**: Configured rate limits on authentication, payment, AI, and messaging endpoints.
- **Data Protection**: Minor-unit integer financial ledger, audit logging for administrative actions, and CORS origin whitelisting.
