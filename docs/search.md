# Lancy Search & Discovery Architecture

## 1. Search Endpoints Overview
- `GET /api/v1/search/freelancers`: Paginated freelancer discovery with filters (`q`, `skills`, `location`, `minRate`, `maxRate`, `minRating`, `availability`, `experience`, `page`, `limit`, `sort`).
- `GET /api/v1/search/projects`: Paginated project marketplace search with filters (`q`, `skills`, `minBudget`, `maxBudget`, `projectType`, `experience`, `page`, `limit`, `sort`).
- `GET /api/v1/search/skills/popular`: Popular marketplace skills aggregated from active listings.
- `GET /api/v1/search/projects/featured`: Active featured projects.

## 2. Search Provider Abstraction (`SearchProvider`)
Search logic is hidden behind the `SearchProvider` interface (`PostgresSearchProvider`), ensuring clean separation from NestJS controllers and enabling future search cluster migrations.

## 3. Pagination Standard
All search requests respond with:
```json
{
  "items": [...],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 120,
    "totalPages": 10
  }
}
```
`limit` is capped at a maximum of `50`.
