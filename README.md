# Lancy — Where Talent Meets Opportunity 🚀

> An open-source, enterprise-grade freelancer marketplace platform connecting world-class talent with high-impact projects. Built with React, TypeScript, NestJS, Prisma, PostgreSQL, Socket.IO, and Firebase Authentication.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0-61dafb)](https://react.dev/)
[![NestJS](https://img.shields.io/badge/NestJS-10.0-e0234e)](https://nestjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6.0-2D3748)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16.0-336791)](https://www.postgresql.org/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.7-010101)](https://socket.io/)

---

## 🌟 Platform Architecture & Features

Lancy is designed around strict domain boundaries, server-authoritative security, financial correctness, and high-performance search discovery.

### Completed Milestones

#### 📌 Phase 1: Clean Domain Architecture & Component Migration
- Refactored generic `Designer` terminology to multi-discipline `Freelancer` (Developers, Designers, Writers, Video Editors, Photographers, Marketers).
- Created domain abstraction layers (`freelancerService`, `projectService`, `contractService`).

#### 📌 Phase 2: NestJS & Prisma Backend Foundation
- Industrial-grade NestJS REST API with Prisma ORM and SQLite/PostgreSQL database support.
- OpenAPI / Swagger documentation rendered live at `/api/docs`.

#### 📌 Phase 3: Authentication, Authorization & Identity
- Firebase Authentication with custom NestJS auth guards (`FirebaseAuthGuard`, `RolesGuard`).
- Strict Role-Based Access Control (`CLIENT`, `FREELANCER`, `ADMIN`).

#### 📌 Phase 4: Project Publishing, Discovery & Proposal Bidding
- Client project creation, publishing, and proposal submission workflows.
- Atomic Prisma `$transaction` handling proposal acceptance and contract creation.

#### 📌 Phase 5: Contract Lifecycle & Milestone Work Approvals
- Milestone amount verification (`sum(milestones) <= contract.agreedAmount`).
- Milestone work lifecycle (`PENDING` $\rightarrow$ `IN_PROGRESS` $\rightarrow$ `SUBMITTED` $\rightarrow$ `APPROVED`). Auto-completion of contracts.

#### 📌 Phase 6: Real-Time WebSockets Messaging & System Notifications
- Authenticated Socket.IO WebSockets gateway (`user:{userId}` and `conversation:{id}` rooms).
- Live real-time chat, unread message badges, and event-driven notifications (`PROPOSAL_RECEIVED`, `PROPOSAL_ACCEPTED`).

#### 📌 Phase 7: Minor-Unit Integer Payments & Double-Entry Financial Ledger
- Server-authoritative payments in minor integer units (cents/paise; no floating point math).
- Webhook signature verification and idempotency protection (`WebhookEvent` with unique `providerEventId`).
- Immutable double-entry financial ledger (`LedgerEntry`: `CLIENT_PAYMENT`, `PLATFORM_FEE`, `FREELANCER_EARNING`, `REFUND`).

#### 📌 Phase 8: Verified Contract Reviews, Ratings & Reputation System
- Verified reviews allowed ONLY on completed contracts (`contract.status === 'COMPLETED'`).
- 1–5 star overall & category ratings (`communication`, `quality`, `professionalism`).
- User reputation summary calculations, rating distribution breakdowns, and 7-day review edit window.

#### 📌 Phase 9: Search, Discovery & Marketplace Matching Foundation
- PostgreSQL-native search provider (`SearchProvider` abstraction).
- Deterministic relevance ranking formula combining skill match, keyword match, reputation signals, and profile completeness.
- URL-synchronized search state (`/freelancers?q=react&minRating=4&sort=relevance`).

---

## 🏗️ Tech Stack Breakdown

| Area | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite, TailwindCSS, Lucide Icons | Responsive SPA with rich glassmorphism UI |
| **Backend** | NestJS 10, TypeScript, RxJS, Swagger / OpenAPI | Modular REST API & WebSocket server |
| **Database** | PostgreSQL / SQLite, Prisma ORM 6 | Relational data persistence & type-safe queries |
| **Real-time** | Socket.IO, `@nestjs/websockets` | Bi-directional live messaging & notifications |
| **Auth** | Firebase Auth, Firebase Admin SDK, JWT | Secure identity & token validation |

---

## 🚀 Quick Start & Local Setup

### Prerequisites
- Node.js `v18.x` or higher
- npm `v9.x` or higher

### 1. Repository Setup
```bash
git clone https://github.com/Hamenath/lancy.git
cd lancy
```

### 2. Frontend Installation
```bash
npm install
npm run dev
```
The frontend application will be running at `http://localhost:5173`.

### 3. Backend Installation & Database Setup
```bash
cd backend
npm install
npx prisma db push
npx prisma generate
npx ts-node src/main.ts
```
The NestJS API server will start at `http://localhost:4000` with Swagger docs at `http://localhost:4000/api/docs`.

---

## 📜 License
Lancy is open-source software licensed under the [MIT License](LICENSE).
