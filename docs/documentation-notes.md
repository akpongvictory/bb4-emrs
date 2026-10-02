



## Day 2 decisions (Sept 30, 2026)
- Server layout stays module-based: `server/src/modules/<domain>/`. Modules are created when the schedule needs them.
- Node module setup: `module`/`moduleResolution` = NodeNext with `"type": "commonjs"` in server/package.json. Files compile as CommonJS, so imports are written without extensions (`./something`). `tsx` runs the dev server; `tsc` type-checks and builds to `dist/`.
- Shared client/server types deferred. Client types live in `client/src/types/`. Revisit after several API modules exist.
- Zod approved for runtime validation of untrusted input. Layers stay separate: TypeScript (compile-time types), Zod (runtime input validation), backend authorization (access control), database constraints (integrity).

## Decisions before Day 4 (Sept 30, 2026)
- Role scope: system-defined roles, assigned per FacilityMembership. One membership may hold several roles. A role in one facility grants nothing in another. No custom role-builder now; leave room for facility-specific custom roles later.
- Authorization evaluates: User + Membership + Role + Permission + Requested resource. The backend is the final authority.
- Internal IDs: UUID. Human-facing numbers are separate fields (Patient.patientNumber, for example BB4-000001).
- Platform admin: isPlatformAdmin boolean on User, default false, server-authoritative. It grants no facility role or permission by itself.
- This RBAC model is approved. Do not redesign it on Day 4 unless a concrete technical conflict is found and reported first.

## Day 4 database notes (Sept 30, 2026)
- Prisma 7: database URL in server/prisma.config.ts, client generated to server/src/generated/prisma (git-ignored), driver adapter @prisma/adapter-pg, dotenv for the CLI. After cloning, run `npm run db:generate`.
- Internal IDs are UUIDs (@db.Uuid). Human-facing numbers arrive with their modules.
- Platform admin is the User.isPlatformAdmin flag only. There is no Platform Admin role row.
- Role.facilityId (custom roles) is not in the schema yet. A nullable column can be added later in one migration. Skipped now because PostgreSQL unique indexes treat NULLs as distinct, so system role keys would need a special partial index.
- Booleans (isActive) are used for status on Facility, User, Department and FacilityMembership.
- FacilityMembership.departmentId must belong to the same facility. This is enforced in the membership service, not by the database.
- Facility.currencyCode defaults to "NGN" as the initial facility currency. FacilitySettings (free-text diagnosis, patient number format, payment methods) arrives in a later module.## Clarifications (Oct 1, 2026)
These supersede any conflicting earlier interpretation.

- Staff onboarding: Facility Admin creates/invites staff, assigns facility, predefined role(s) and department, activates/deactivates accounts, and manages access within the approved role system. Permissions: users.view, users.create, users.update, users.deactivate, users.assign_roles.
- Administration is separate from clinical access. Facility Admin gets no clinical permissions because it manages users. Non-clinical staff keep the operational access their workflow needs.
- Roles are predefined for common staff categories. Authorization stays permission-based so facility-specific roles and extra permissions can be added later without rewriting RBAC. Model: User, Facility Membership, Role(s), Permissions, allowed actions plus resource scope.
- Front Desk can view demographics, registration info, previous encounters, appointment history, payer/HMO info and billing status (billing.view_status). Front Desk cannot view physician notes, nursing notes or private clinical observations unless facility policy grants it.
- "Patient can be found" and "whole medical record is visible" are different permissions. Clinical content sits behind separate resources (clinical_notes, nursing_notes, diagnoses, vitals, orders and so on).
- Password hashing: Argon2id (argon2 npm package), 19 MiB memory, 2 passes, 1 lane. Replaces the bcryptjs trial. Verified on the development machine. Production verification happens on the first real deployment. If deployment compatibility becomes a problem, report before changing the decision.
- Deployment direction (not a locked provider decision): no Docker. GitHub, then Vercel (frontend) and Render/Railway or similar (backend), with managed PostgreSQL. Evaluate backend hosts on Node/TypeScript support, PostgreSQL connectivity, env vars, logs, health checks, custom domains, HTTPS, background jobs, pricing, reliability and suitability for Nigerian/African operations. No Vercel-specific logic in the frontend.
- Production database is managed PostgreSQL. Schema changes go through Prisma migrations only. Any manual production change is documented.
- Production parity: same Node major version (engines field and .node-version), reproducible npm install, env vars, build and migration scripts, health checks, structured logging, HTTPS, secure cookies, CORS, production error handling. Avoid hardcoded localhost URLs, ports and secrets, local-filesystem permanent uploads, OS-specific assumptions.
- File storage stays behind the storage service abstraction (local in development, object storage in production). No large files in PostgreSQL.

## Day 6 backend foundation notes
- Express 5 with async errors forwarded to one error handler. app.ts builds the app, server.ts starts it.
- env.ts requires PORT, DATABASE_URL and CLIENT_ORIGIN with no hardcoded defaults.
- Logs are JSON lines. Request logs never include bodies or query strings.
- Health: GET /api/health (liveness), GET /api/health/ready (database check, 503 on failure).
- Error handler maps AppError, Zod errors (400), malformed JSON (400), Prisma P2002 (409) and P2025 (404), and returns a generic 500 for anything else.