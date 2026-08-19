<div align="center">

# 🚀 Lancy

### *Where Talent Meets Opportunity*

An open-source, full-stack freelancer marketplace platform built with NestJS, React, TypeScript, Prisma, and AI Candidate Matching.

[![Build & CI](https://github.com/Hamenath/lancy/actions/workflows/ci.yml/badge.svg)](https://github.com/Hamenath/lancy/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/Hamenath/lancy/releases/tag/v1.0.0)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-green)](https://nodejs.org/)

</div>

---

## 🌟 What is Lancy?

**Lancy** is a complete, production-ready open-source freelancer marketplace platform. It enables clients to publish projects, receive bids, establish milestone-based contracts, execute payments via an immutable double-entry financial ledger, communicate in real-time, rate completed work, and leverage AI for semantic candidate matching and proposal assistance.

Whether you want to launch a specialized freelance network, self-host a private talent platform, or explore modern full-stack web architecture, Lancy provides a solid, secure foundation out of the box.

---

## ⚡ Key Features

| Category | Feature Description |
| :--- | :--- |
| 👤 **Identity & Auth** | Server-authoritative RBAC (`CLIENT`, `FREELANCER`, `ADMIN`) protected by Firebase Auth & NestJS guards. |
| 💼 **Projects & Bidding** | Project publishing, experience filters, proposal bidding, and shortlist workflows. |
| 🤝 **Contracts & Milestones** | Milestone submission, change requests, and client approval auto-completion. |
| 💳 **Financial Ledger** | Minor-unit integer money math (cents), double-entry `LedgerEntry` tables, Stripe Mock provider, and webhook idempotency. |
| 💬 **Real-Time Messaging** | Socket.IO WebSocket Gateway for instant chat and live unread notification badges. |
| ⭐ **Verified Reviews** | Verified contract ratings (1-5 integer scores, category breakdowns, 7-day edit window). |
| 🔎 **Relevance Search** | PostgreSQL & SQLite native multi-signal relevance search with URL query synchronization. |
| 🛡️ **Trust & Safety** | Admin dashboard (`/admin`), user suspension, project moderation, disputes, and append-only `AuditLog`. |
| 📊 **Analytics & Reporting** | Real-time platform GMV, revenue time-series, freelancer earnings charts, and CSV exports. |
| 🤖 **AI Intelligence** | Gemini & Mock AI provider abstraction, skill extraction, proposal drafting assistant, and candidate matching. |
| 🚀 **DevOps & Production** | Health probes (`/health`, `/ready`), correlation IDs (`x-request-id`), Dockerfile, and GitHub CI workflow. |

---

## 🏗️ System Architecture

```
                     INTERNET
                         │
                         ▼
                    CDN / DNS
                         │
                         ▼
                  LOAD BALANCER
                         │
              ┌──────────┴──────────┐
              │                     │
           FRONTEND              BACKEND
        (React/Vite)         (NestJS/Prisma)
              │                     │
              │              ┌──────┼────────┐
              │              │      │        │
              │           AUTH   API      JOBS
              │                     │        │
              │              ┌──────┼────────┤
              │              │      │        │
              │           SQLITE/   CACHE   STORAGE
              │          POSTGRES   (In-Mem)
              │              │
              │        ┌─────┴──────┐
              │        │            │
              │     PAYMENTS       AI
              │   (Ledger Cents) (Provider Abstraction)
              │
              └──────────────┬──────────────
                             │
                       OBSERVABILITY
                             │
                ┌────────────┼────────────┐
                │            │            │
             LOGS          METRICS      ERRORS
        (Correlation ID) (/health)  (Global Filter)
```

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, React Router DOM.
- **Backend API**: NestJS, Node.js 20, TypeScript, RxJS, Express.
- **Database & ORM**: SQLite (Development) / PostgreSQL (Production), Prisma ORM v6.
- **WebSockets**: Socket.IO authenticated gateways.
- **AI Infrastructure**: Google Gemini API (`GeminiAIProvider`) & Deterministic Fallback (`MockAIProvider`).
- **DevOps**: Docker, Docker Compose, GitHub Actions CI.

---

## 🚀 Quick Start (Local Development)

### 1. Clone Repository & Install Dependencies
```bash
git clone https://github.com/Hamenath/lancy.git
cd lancy
npm install
cd backend && npm install
```

### 2. Configure Environment
```bash
cp backend/.env.example backend/.env
```

### 3. Initialize Database & Seed Demo Data
```bash
cd backend
npx prisma db push
npm run db:seed
```

### 4. Launch Development Servers
- **Backend API** (Terminal 1):
  ```bash
  cd backend && npm run dev
  ```
- **Frontend App** (Terminal 2):
  ```bash
  npm run dev
  ```

Access the application at:
- **Frontend UI**: `http://localhost:5173`
- **Backend API**: `http://localhost:4000`
- **Swagger Docs**: `http://localhost:4000/api/docs`

---

## 🐳 Quick Start with Docker

Run the complete platform stack in one command:
```bash
docker compose up -d
```

---

## 🔑 Demo Login Accounts

After running `npm run db:seed`, you can log in using these demo credentials:

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Client** | `client@lancy.dev` | *(Any value in dev mode)* | Project creation, hiring, spending analytics. |
| **Freelancer** | `freelancer@lancy.dev` | *(Any value in dev mode)* | Proposals, milestones, net earnings charts. |
| **Admin** | `admin@lancy.dev` | *(Any value in dev mode)* | Admin dashboard (`/admin`), user suspension, disputes, audit logs. |

---

## 📚 Documentation Directory

- 📄 [Self-Hosting Guide](docs/self-hosting.md)
- 📄 [Environment Variables Specification](docs/environment.md)
- 📄 [Complete System Architecture](docs/architecture.md)
- 📄 [Production Hardening Checklist](docs/production-checklist.md)
- 📄 [Security Policy & Disclosures](SECURITY.md)
- 📄 [Contributing Guidelines](CONTRIBUTING.md)
- 📄 [Changelog](CHANGELOG.md)
- 📄 [Product Roadmap](ROADMAP.md)
- 📄 [FAQ](docs/faq.md)

---

## 🤝 Contributing

We welcome contributions from the community! Please read our [Contributing Guidelines](CONTRIBUTING.md) and [Code of Conduct](CODE_OF_CONDUCT.md) before submitting a Pull Request.

---

## 📄 License

Lancy is open-source software licensed under the [MIT License](LICENSE).
