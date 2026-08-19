# Lancy Vector Embeddings & Caching

## 1. Embedding Model Specification
```prisma
model Embedding {
  id          String   @id @default(uuid())
  entityType  String   // FREELANCER | PROJECT
  entityId    String
  vector      String   // Serialized float array string
  contentHash String
  model       String   @default("text-embedding-004")
  createdAt   DateTime @default(now())

  @@unique([entityType, entityId])
}
```

## 2. Content Hash Deduplication
To prevent redundant API cost and latency, embeddings are regenerated only when the source entity `contentHash` changes.
