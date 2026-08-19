# Frequently Asked Questions (FAQ)

### What is Lancy?
Lancy is an open-source freelancer marketplace platform built with NestJS, React, TypeScript, and Prisma.

### Is Lancy free and open-source?
Yes, Lancy is licensed under the OSI-approved MIT License. You are free to modify, host, and deploy it commercially.

### Which databases are supported?
Lancy supports SQLite out-of-the-box for rapid local development and PostgreSQL for production deployments.

### Can I run Lancy without purchasing AI API keys?
Yes! Lancy includes a deterministic `MockAIProvider` that simulates AI skill extraction, proposal assistance, and matching without needing paid API keys.

### How does financial ledger math work in Lancy?
Lancy represents all monetary values strictly as integer minor units (cents). Floating-point currency math is strictly prohibited.
