# Lancy Financial Security & PCI Compliance Architecture

## 1. Money Representation Rule
- Money is stored strictly as integer minor units (`Int`).
- Floating-point calculations (`0.1 + 0.2`) are prohibited.
- Currency conversions and platform fee calculations use integer arithmetic (`Math.floor((amount * bps) / 10000)`).

## 2. Server-Authoritative Payable Amounts
- Frontend cannot submit payable amounts.
- `POST /api/v1/payments` receives `{ milestoneId }`. Server calculates expected payable amount directly from `Milestone.amount`.

## 3. PCI Compliance Directive
- Lancy does NOT store raw credit card numbers, CVVs, or expiration dates.
- Payments use provider-hosted user interfaces and tokenized transaction references (`providerPaymentId`).
