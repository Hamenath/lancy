# Recommendation Engine Architecture

```
                    TRIGGER
            (Project / Freelancer View)
                       │
                       ▼
             CANDIDATE GENERATION
       (Filter Active Pool Entities)
                       │
                       ▼
             MULTI-SIGNAL RANKING
     (Skill, Semantic, Rating, Budget, Freshness)
                       │
                       ▼
             COLD-START & DIVERSITY
        (Rising Star Boost & Deduplication)
                       │
                       ▼
              EXPLAINABLE OUTPUT
         (Human-Readable Match Reason)
                       │
                       ▼
               FEEDBACK LOGGING
      (SHOWN, CLICKED, DISMISSED, APPLIED)
```

## Overview
Lancy's recommendation service combines multi-signal candidate generation with explainable match metrics. Instead of relying on a black-box model, it scores entities deterministically while tracking conversion feedback.
