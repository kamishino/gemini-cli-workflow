# ⚡ SKILL: The Boring Backend (MVP)

Description: A rigid, reliable, production-ready backend setup for Indie Hackers.

## 1. 🏗️ The Stack (Non-Negotiable)

- **Runtime:** Node.js (LTS).
- **Framework:** Express.js (v5 preferred) - Optimized for simplicity.
- **Database:** `better-sqlite3` (Dev) -> Postgres (Prod). No ORM overdrive, use `Kysely` or raw SQL builder.
- **Validation:** `Zod` for EVERYTHING (Env vars, API inputs).

## 2. 📂 Directory Structure (Feature-Based)

```text
src/
├── config/         # Env vars (validated by Zod)
├── features/       # Vertical Slices
│   ├── auth/       # Feature: Auth
│   │   ├── auth.routes.ts
│   │   ├── auth.service.ts
│   │   └── auth.schema.ts
│   └── users/
├── middlewares/    # Global middlewares (ErrorHandler, Logger)
├── db/             # Database migrations & client
└── server.ts       # Entry point
```

## 3. 🛡️ Golden Snippets

### A. The Setup (Express + Zod)

```typescript
import express from "express";
import { z } from "zod";

const app = express();
app.use(express.json());

// Async Handler Wrapper (No try/catch clutter)
const asyncHandler = (fn: Function) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

app.get("/health", (req, res) => res.json({ status: "ok" }));

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal Server Error" });
});
```

### B. Env Validation (Fail Fast)

```typescript
const EnvSchema = z.object({
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string(),
});
export const env = EnvSchema.parse(process.env);
```

## 4. 🛑 Anti-Patterns

- **NO** Controller Classes. Use simple exported functions.
- **NO** Logic in Routes. Routes only unwrap requests and call Services.
- **NO** `any` types.
