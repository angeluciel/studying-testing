# Backend Agent Guide

## Overview

Express 5 + TypeScript backend with PostgreSQL (raw SQL, no ORM), JWT auth, Zod validation, and Vitest integration tests running against real Docker containers via Testcontainers.

## Stack

- **Runtime:** Node.js + tsx (TypeScript execution, no compile step in dev)
- **Framework:** Express 5
- **Database:** PostgreSQL 17 — raw SQL via `pg`, no ORM
- **Auth:** JWT (Bearer token, 1-day expiry) + bcrypt (12 rounds)
- **Validation:** Zod 4
- **Email:** Nodemailer + React Email templates
- **Logging:** Pino + pino-http (disabled in test env)
- **Testing:** Vitest 4 + Supertest + Testcontainers

## Project Structure

```
src/
├── app.ts                  # Express app, routes, middleware registration
├── server.ts               # Entry point, listens on PORT
├── config/env.ts           # Zod-validated env vars (fail-fast on startup)
├── db/
│   ├── pool.ts             # pg Pool singleton
│   ├── migrate.ts          # SQL migration runner
│   ├── seed.ts             # Dev seeding (admin + regular user)
│   ├── resetDatabase.ts    # TRUNCATE all tables except migrations
│   └── testContainers/     # Postgres + Mailpit container setup for tests
├── middlewares/
│   ├── auth.middleware.ts        # Validates Bearer JWT, attaches req.user
│   ├── error.middleware.ts       # Centralised error handler (Zod, AppError, generic)
│   └── requireRole.middleware.ts # Role-based access (admin | user)
├── modules/
│   ├── auth/               # Login, password reset (routes, controller, service, test)
│   ├── users/              # CRUD users (routes, controller, service, test)
│   ├── globalSetup.ts      # Vitest global: start containers, run migrations
│   └── setup.ts            # Vitest per-file: reset DB, clear mocks, close pool
├── emails/                 # React Email templates (WelcomeEmail, PasswordResetEmail)
├── tests/helpers/auth.ts   # createAuthenticatedUser(role) — returns { user, token }
├── types/                  # User type, Express augmentation (req.user), Vitest globals
└── utils/                  # jwt, password (bcrypt), tokens, mail, logger
```

## Architecture Pattern

```
Route → Controller (Zod validation) → Service (business logic + SQL) → pg pool
```

Errors bubble up to `error.middleware.ts` which handles:
- `ZodError` → 400 with flattened field errors
- `AppError` → statusCode + message
- Postgres `23505` (unique violation) → 409
- Everything else → 500

## Commands

```bash
pnpm dev              # tsx watch — auto-reloads on change
pnpm test             # Run tests once (NODE_ENV=test)
pnpm test:watch       # Watch mode
pnpm test:coverage    # Coverage report (v8)
pnpm migrate          # Run pending migrations (dev)
pnpm seed             # Seed admin + regular user (dev)
pnpm build            # Compile to dist/
pnpm start            # Run dist/server.js
```

## Testing

Tests are **integration tests** — they hit a real PostgreSQL instance (Testcontainer) and a real Mailpit SMTP server. There are no unit tests with mocked databases.

### How it works

1. `globalSetup.ts` starts containers once for the whole test run and injects `DATABASE_URL`, `SMTP_HOST`, `SMTP_PORT`, `MAILPIT_UI_PORT` into the environment.
2. `setup.ts` runs before each test file: resets DB (TRUNCATE CASCADE), clears all mocks, closes the pool after all tests.
3. Tests import `app` from `src/app.ts` and use `supertest` to make requests.

### Writing tests

```typescript
import request from 'supertest';
import { app } from '../../app.js';
import { createAuthenticatedUser } from '../../tests/helpers/auth.js';

describe('POST /users', () => {
  it('creates a user', async () => {
    const res = await request(app)
      .post('/users')
      .send({ name: 'João', surname: 'Test', email: 'test@example.com', password: 'secret123' });

    expect(res.status).toBe(201);
    expect(res.body.email).toBe('test@example.com');
  });
});

describe('GET /users/me', () => {
  it('returns current user', async () => {
    const { token } = await createAuthenticatedUser('user');

    const res = await request(app)
      .get('/users/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
  });
});
```

- Mock email sending with `vi.mock('../../utils/mail.js')` — do not send real emails in tests.
- The DB is fully reset between test files, so each file starts clean.
- `createAuthenticatedUser(role)` inserts a user in the DB and returns `{ user, token }`.

## Adding a New Module

1. Create `src/modules/<name>/` with `<name>.routes.ts`, `<name>.controller.ts`, `<name>.service.ts`, `<name>.routes.test.ts`.
2. Register the router in `src/app.ts`.
3. Add migrations to `src/db/migrations/` (alphabetical order = execution order).

## Database Conventions

- Raw SQL with parameterised queries (`$1`, `$2`) — no string interpolation in queries.
- All queries go through the `pool` singleton from `src/db/pool.ts`.
- Use transactions for multi-step operations (see `auth.service.ts` password reset).
- UUIDs as primary keys (`gen_random_uuid()`).
- `updated_at` is managed manually — update it explicitly on PATCH.

## Auth Conventions

- JWT payload: `{ sub: userId, role, email }`
- `authMiddleware` attaches `req.user` — TypeScript type is in `src/types/express.d.ts`.
- Password reset tokens: `crypto.randomBytes(32)` → stored as SHA-256 hash, 30-min expiry.
- Emails are normalised to lowercase before storing and querying.

## Validation Conventions

- Zod schemas are defined in the controller file, not a separate schema file.
- Always return flattened errors: `error.flatten().fieldErrors` for field-level messages.
- Use `.pipe(z.email())` for email fields.

## Known Issues

- `auth.service.ts` line ~69: checks `pct.user_at` (typo) — should be `pct.used_at`. This breaks the "token already used" guard on password resets.

## Environment Variables

See `.env.example`. Required vars (validated at startup via `src/config/env.ts`):

| Variable | Purpose |
|---|---|
| `PORT` | Server port |
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Token signing secret |
| `APP_BASE_URL` | Used in email links |
| `SMTP_HOST/PORT/USER/PASS` | Mail transport |
| `MAIL_FROM` | Sender address |

Test env (`.env.test`) pre-configures most values; `DATABASE_URL` is injected at runtime by Testcontainers.
