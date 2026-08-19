# Lancy Phase 8: Reviews, Ratings, Reputation & Trust System Analysis

## 1. Executive Summary
Phase 8 implements Lancy's reputation and trust architecture. Reviews and ratings can ONLY be submitted by participants of completed contracts (`status === 'COMPLETED'`).

```
Contract COMPLETED -> Eligibility Check -> Reviewer (Client or Freelancer) Submits 1-5 Rating & Category Ratings -> Server Derives Reviewer/Reviewee IDs -> Verified Review Created -> Reputation Metrics Updated & Notification Pushed
```

## 2. Core Security & Domain Rules
1. **Strict Eligibility Enforcement**: Reviews on incomplete contracts or from non-participants are rejected (`403 Forbidden`).
2. **One Review Per Participant Per Contract**: Compound unique constraint `@@unique([contractId, reviewerId])` prevents duplicate reviews.
3. **No Self-Reviews**: Server enforces `reviewerId !== revieweeId`.
4. **Server-Derived Identity**: `reviewerId` is derived from `req.user.id`; `revieweeId` is derived from the contract relationship.
5. **Rating Boundary Controls**: All ratings (`rating`, `communicationRating`, `qualityRating`, `professionalismRating`) must be integers between 1 and 5.
6. **7-Day Edit Window**: Original reviewer can update review within 7 days of creation (`createdAt + 7 days`). Afterward, reviews are locked.

## 3. Data Model Specification (`schema.prisma`)
- **`Review`**: `id`, `contractId`, `reviewerId`, `revieweeId`, `rating`, `communicationRating`, `qualityRating`, `professionalismRating`, `comment`, `status` (`PUBLISHED`, `HIDDEN`, `FLAGGED`, `REMOVED`), `verified` (`Boolean`), `createdAt`, `updatedAt`.
- **`ReviewReport`**: `id`, `reviewId`, `reporterId`, `reason` (`SPAM`, `HARASSMENT`, `OFFENSIVE`, `FAKE_REVIEW`, `PERSONAL_INFORMATION`, `OTHER`), `description`, `status` (`PENDING`, `RESOLVED`, `DISMISSED`), `createdAt`.
