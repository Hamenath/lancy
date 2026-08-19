# Cold-Start Strategy & Fairness

## Problem
In traditional marketplaces, newly joined freelancers with zero reviews ($0\text{ reviews}$) are filtered out or buried at the bottom of search results, leading to vendor lock-in for incumbents.

## Solution: Rising Star Boost
1. **Eligibility Criteria**:
   - `reviewsCount` < 2
   - `isVerified` = `true`
   - Profile completeness $> 80\%$
2. **Cold-Start Adjustment**:
   - Applies positive score boost ($+0.05$) to candidate rankings.
   - Tags match reason with `[Verified Rising Star]`.
