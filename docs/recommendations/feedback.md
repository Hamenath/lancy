# Recommendation Feedback & Conversion Analytics

## Event Lifecycle
```
Recommendation Shown (SHOWN)
         │
         ├──► Recommendation Clicked (CLICKED) ──► Proposal Submitted (APPLIED) ──► Hired (HIRED)
         │
         └──► Recommendation Dismissed (DISMISSED)
```

## Analytics Metrics
- **Click-Through Rate (CTR)**: $\frac{\text{CLICKED}}{\text{SHOWN}} \times 100\%$.
- **Admin Real-Time Tuning**: Platform administrators can rebalance signal weights (`PATCH /api/v1/admin/recommendations/weights`) based on CTR performance.
