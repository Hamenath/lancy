# Lancy Phase 15: Intelligent Marketplace Growth & Recommendation Engine Analysis

## 1. Executive Summary
Phase 15 transforms Lancy from a CRUD marketplace into an intelligent, learning marketplace platform. It introduces a multi-signal recommendation engine that generates personalized candidate freelancer matches for clients and tailored project recommendations for freelancers.

```
Client Project / Freelancer Profile -> Candidate Generation -> Multi-Signal Scoring Engine -> Cold-Start Boost / Diversity Filter -> Explainable Match Breakdown -> User Feedback Loop
```

## 2. Recommendation Architecture & Multi-Signal Scoring Formula

$$\text{Final Score} = S_{\text{Skill}} (35\%) + S_{\text{Semantic}} (20\%) + S_{\text{Reputation}} (15\%) + S_{\text{Budget}} (15\%) + S_{\text{Freshness}} (10\%) + S_{\text{ColdStart}} (5\%)$$

### Key Signals:
1. **Skill Alignment ($S_{\text{Skill}}$ - 35%)**: Exact & overlap match ratio of requested vs verified profile skills.
2. **Semantic Similarity ($S_{\text{Semantic}}$ - 20%)**: Vector similarity score derived from `Embedding` content hashes.
3. **Reputation & Contracts ($S_{\text{Reputation}}$ - 15%)**: Weighted review rating (1-5) and completed marketplace contract volume.
4. **Budget Compatibility ($S_{\text{Budget}}$ - 15%)**: Ratio of project budget to freelancer hourly rate.
5. **Freshness & Activity ($S_{\text{Freshness}}$ - 10%)**: Recency of project creation or freelancer login activity.
6. **Cold-Start Boost ($S_{\text{ColdStart}}$ - 5%)**: Boost factor for new freelancers with complete profiles ($>80\%$) and zero completed contracts to ensure fair marketplace opportunity.

## 3. Data Model Additions (`schema.prisma`)
- **`RecommendationFeedback`**: `id`, `actorId`, `recommendationType` (`FREELANCER`, `PROJECT`), `targetId`, `action` (`SHOWN`, `CLICKED`, `DISMISSED`, `APPLIED`, `HIRED`), `createdAt`.
- **`RecommendationWeight`**: `id`, `skillWeight`, `semanticWeight`, `reputationWeight`, `budgetWeight`, `freshnessWeight`, `coldStartWeight`, `updatedAt`.
