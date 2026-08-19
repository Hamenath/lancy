# Lancy Relevance Ranking System

## 1. Relevance Score Formula
Relevance scores are calculated deterministically across candidate profiles:

```
Relevance Score =
  Name Keyword Match Weight (50 pts)
  + Headline Title Match Weight (40 pts)
  + Reputation Weight (Rating * 10 pts)
  + Verified Profile Boost (15 pts)
```

## 2. Skill Match Weighting
Exact skill array matches rank higher than general text mentions in bio columns to ensure candidate relevance.
