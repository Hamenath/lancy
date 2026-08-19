# Contributing to Lancy

Thank you for contributing to **Lancy — "Where Talent Meets Opportunity"**!

## Development Setup
1. Clone repository: `git clone https://github.com/Hamenath/lancy.git`
2. Install frontend dependencies: `npm install`
3. Install backend dependencies: `cd backend && npm install`
4. Setup database: `npx prisma db push && npx prisma generate`
5. Run dev servers:
   - Frontend: `npm run dev` (http://localhost:5173)
   - Backend: `npm run start:dev` (http://localhost:4000)

## Pull Request Guidelines
- Branch naming convention: `feat/feature-name`, `fix/bug-description`, `security/hardening-item`.
- All PRs must pass `npm run build` in both root and `backend/` directories.
- Provide a summary and screenshot in the PR template.
