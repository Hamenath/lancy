# Lancy Security Checklist

- [x] **IDOR Verification**: Endpoints require explicit resource ownership check (`contract.clientId === userId || contract.freelancerId === userId`).
- [x] **Mass Assignment**: DTO validation Whitelisting prevents role escalation.
- [x] **Secret Audit**: `.env` ignored in Git; `.env.example` safe placeholders provided.
- [x] **Rate Limiting**: Throttler protection on sensitive auth, payment, AI, and messaging routes.
- [x] **Sanitization**: XSS defense on user bios, reviews, and project descriptions.
