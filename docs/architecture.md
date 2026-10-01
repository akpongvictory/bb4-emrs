# BB4 EMRs Architecture

Status: Day 3 (Sept 30, 2026). Source of truth: Master Specification v1.0 plus approved decisions in docs/documentation-notes.md.

## 1. Overview

    Browser: React + Vite + TypeScript + Tailwind
        |  HTTPS, JSON, httpOnly cookie
    API: Node.js + Express + TypeScript (modular monolith)
        |  Prisma
    PostgreSQL: one shared database, facilityId on operational tables

## 2. Stack

| Layer | Choice |
|---|---|
| Frontend | React, Vite, TypeScript, Tailwind CSS, React Router, Fetch API, Context API |
| Backend | Node.js, Express, TypeScript, REST |
| Validation | Zod (runtime input validation) |
| Database | PostgreSQL with Prisma ORM |
| Dev tooling | tsx (dev runner), tsc (type-check and build) |

Not used: microservices, event buses, queues, Kubernetes, Redux/Zustand.

## 3. Frontend/backend boundary

| Frontend owns | Backend owns |
|---|---|
| Screens, forms, navigation | Authentication and sessions |
| Input collection and client-side checks | Authorization and permission enforcement |
| Loading, empty, error, success states | Facility isolation |
| Role-aware menus (convenience only) | Business rules and workflow state |
| API calls through `src/services/` | Financial calculations, tariffs, balances |
| | Validation, audit logging, reports |

The frontend never decides security, prices, totals or payment state.

## 4. Request lifecycle

1. Authenticate: read the session cookie, load the user.
2. Resolve facility: take the active facility from the session and confirm the user has an active membership.
3. Authorize: combine the permissions of the roles on the user's membership for the active facility, then check the route's required permission.
4. Validate: parse body, query and params with Zod.
5. Execute: the service runs business rules and Prisma queries, always scoped by facilityId.
6. Audit: write the audit record in the same transaction as the change.
7. Respond: return the standard success or error shape.

## 5. Module layout

Each domain lives in `server/src/modules/<domain>/`:

    <domain>.routes.ts       route paths and middleware chain
    <domain>.controller.ts   thin: read request, call service, send response
    <domain>.service.ts      business rules and Prisma calls
    <domain>.schemas.ts      Zod schemas and inferred types

- Keep controllers free of business rules.
- Call Prisma from services. Add a repository layer only if a real need appears.
- Call another module's service functions instead of copying its queries.
- Create a module only when the schedule needs it.

Shared infrastructure stays outside modules: `config/`, `middleware/`, `services/` (audit, storage, id generation), `utils/`.

Client mirrors the idea: `src/features/<domain>/` for screens and domain components, `src/services/` for API calls, `src/types/` for types, `src/components/` for shared UI only.

## 6. Module schedule

| Phase | Modules |
|---|---|
| Phase 1 | auth, facilities, users, patients, appointments, encounters, clinical (vitals, consultation, diagnosis, orders, prescriptions) |
| Phase 2 | laboratory, imaging, pharmacy, procedures, referrals, support units, catalog (services and tariff foundation) |
| Phase 3 | billing, payers, claims, imports, reporting, audit views |

## 7. Layers of protection

| Layer | Protects against |
|---|---|
| TypeScript | Coding mistakes at compile time |
| Zod | Malformed or hostile input at runtime |
| Backend authorization | Users acting outside their permissions |
| Facility scoping | Cross-facility data access |
| Database constraints | Broken relationships and duplicate records |

No layer replaces another.

## 8. API conventions

- Base path `/api`. Plural, lowercase, hyphenated nouns (`/api/patients`, `/api/lab-orders`).
- Use standard verbs: GET read, POST create, PATCH partial update. Cancel or reverse through explicit action endpoints, not DELETE, for clinical and financial records.
- Success body: `{ "data": ... }` with `{ "meta": { page, pageSize, total, totalPages } }` on lists.
- Error body: `{ "error": { "code": "VALIDATION_ERROR", "message": "...", "details": [...] } }`.
- Paginate every list: `?page=1&pageSize=20`, with a server-side maximum page size.
- Send dates as ISO 8601 UTC strings.
- Send money as decimal strings (`"1500.00"`), never floats.
- Financial write endpoints accept an `Idempotency-Key` header (detailed design on Day 66).

| Status | Use |
|---|---|
| 200 / 201 | Success / created |
| 400 | Validation error |
| 401 | Not authenticated |
| 403 | Authenticated but missing permission |
| 404 | Not found, including records outside the user's facility |
| 409 | Conflict (duplicate, invalid state change) |
| 500 | Unexpected server error |

## 9. Error handling

- Throw typed errors (`AppError` with status and code) from services.
- Catch everything in one error-handling middleware.
- Map Zod errors to 400 with field-level details.
- Map Prisma unique violations to 409.
- Return a generic 500 message and log the detail server-side. Never expose stack traces.
- Answer 404, not 403, when a record belongs to another facility, so its existence is not revealed.
- Client: `apiClient` wraps fetch and converts failures into one `ApiError` type. Every screen shows loading, empty and error states.

## 10. Naming conventions

- Follow docs/conventions.md.
- Prisma models: PascalCase singular. Fields: camelCase. Enum values: UPPER_SNAKE_CASE.
- Permission keys: `resource.action`, lowercase, underscores inside the action (`billing.receive_payment`).
- Server files: `<domain>.<role>.ts`. Client files: PascalCase for components, camelCase otherwise.

## 11. Environment variables

Server (`server/.env`):

| Name | Purpose |
|---|---|
| PORT | API port (default 5000) |
| NODE_ENV | development, test or production |
| DATABASE_URL | PostgreSQL connection string |
| JWT_SECRET | Token signing secret |
| JWT_EXPIRES_IN | Token lifetime |
| CLIENT_ORIGIN | Allowed browser origin for CORS and cookies |

Client (`client/.env`): `VITE_API_URL`.

Add storage and other variables when their module needs them. Never commit `.env`. Never put secrets in `VITE_` variables.

## 12. Deferred

Shared client/server types, NHIA/PLASCHEMA workflow detail, migration tooling, offline support, interoperability.