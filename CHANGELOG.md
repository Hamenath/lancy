# Changelog - Lancy Marketplace

All notable changes to Lancy are documented in this file using Keep a Changelog format.

## [1.0.0] - 2026-08-19

### Added
- **Phase 1 (Architecture & Taxonomy)**: Multi-discipline `Freelancer` migration and domain services.
- **Phase 2 (Backend Foundation)**: NestJS API framework, Prisma ORM, and Swagger documentation.
- **Phase 3 (Auth & Identity)**: Firebase authentication guards, RBAC roles (`CLIENT`, `FREELANCER`, `ADMIN`), and `/api/v1/auth/me`.
- **Phase 4 (Projects & Proposals)**: Marketplace project listings, proposal submission pipeline, and atomic contract creation transactions.
- **Phase 5 (Contracts & Milestones)**: Milestone submission, change requests, and client approval auto-completion.
- **Phase 6 (Real-Time Messaging)**: Socket.IO WebSocket gateway, unread badge counters, and chat history REST API.
- **Phase 7 (Payments & Financial Ledger)**: Integer minor-unit money math (cents), Stripe Mock provider, webhook idempotency, and immutable double-entry `LedgerEntry` tables.
- **Phase 8 (Reviews & Reputation)**: Verified contract review system (1-5 integer ratings, communication/quality category scores, 7-day edit window, moderation reports).
- **Phase 9 (Search & Relevance Ranking)**: PostgreSQL-native search provider with deterministic multi-signal relevance scoring.
- **Phase 10 (Admin Dashboard & Trust)**: RBAC admin panel (`/admin`), user suspension, project moderation, contract dispute resolution, and append-only `AuditLog`.
- **Phase 11 (Analytics & Intelligence)**: Source-of-truth GMV, Platform Revenue, freelancer earnings time-series, client spending charts, and CSV report export.
- **Phase 12 (AI Marketplace Intelligence)**: Provider-independent AI layer (`GeminiAIProvider`, `MockAIProvider`), skill extraction, proposal drafting assistant, hybrid candidate matching, and AI Assistant modal.
- **Phase 13 (Production Hardening & DevOps)**: Correlation ID middleware (`x-request-id`), standardized exception filter, `/health` & `/ready` probes, multi-stage Dockerfile, and GitHub Actions CI workflow.
- **Phase 14 (v1.0.0 Open Source Release)**: Deterministic database seed script (`backend/prisma/seed.ts`), complete `README.md` overhaul, issue templates, self-hosting guide, and release notes.
