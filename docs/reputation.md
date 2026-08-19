# Lancy Reputation System & Rating Aggregations

## 1. Reputation Summary Endpoint
`GET /api/v1/users/:userId/reputation`

```json
{
  "userId": "...",
  "averageRating": 4.833333333333333,
  "formattedAverageRating": "4.8",
  "totalReviews": 12,
  "completedContractsCount": 10,
  "categoryAverages": {
    "communication": 4.9,
    "quality": 4.8,
    "professionalism": 4.7
  },
  "distribution": {
    "5": 10,
    "4": 2,
    "3": 0,
    "2": 0,
    "1": 0
  }
}
```

## 2. Verified Review Badge
Reviews originating from completed contracts automatically carry `verified = true` to render the "Verified Contract" badge on freelancer and client profiles.
