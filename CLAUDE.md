# BB4 EMRs

Reusable multi-facility EMR/HIS platform by BuildBig4 Africa. Healthcare workflow system, not a generic dashboard.

## Read first (on demand, not all at once)
- docs/STATUS.md: current state, decisions log, next steps
- docs/source/master-spec.md: product source of truth
- docs/source/master-implementation-prompt.md: the 90-day plan and rules
- docs/development-plan.md: amendments to the plan
- docs/architecture.md, domain-model.md, multi-facility.md, auth-flow.md, authorization.md, user-management.md, requirements-register.md

## Stack
Client: React, Vite, TypeScript (strict), Tailwind 4, React Router 7.
Server: Node (version in .node-version), Express 5, TypeScript, Prisma 7, PostgreSQL, Zod, Argon2id.
Modular monolith. No Docker, microservices or new infrastructure without approval.

## Commands
- Server: `npm run dev`, `typecheck`, `build`, `db:migrate`, `db:generate`, `db:seed` (cwd: server)
- Client: `npm run dev`, `typecheck`, `lint`, `build` (cwd: client)
- A change is not done until typecheck, lint (client) and build pass on the side you touched.

## Architecture rules
- Server modules live in server/src/modules/<domain>/ (routes, controller, service, schemas).
- Every protected route: `authenticate` then `requirePermission("module.action")`. Facility id comes only from `getFacilityAuth(req)`, never from the request.
- Backend owns business rules, permissions, money math and audit. The frontend only reflects.
- Money: Prisma Decimal, never floats. JSON sends decimal strings.
- Writes that matter record an audit entry in the same transaction (`recordAudit`). Never put passwords or hashes in logs or audit values.
- New lists paginate (`{ data, meta }`). Errors use `AppError` and the shared error shape.
- Roles are system-defined and assigned per facility membership. Physician notes and nursing notes stay separate resources.
- Everything configurable per facility lives in data, not code.

## How we work (supervised)
1. Work one planned task at a time. Start every task in plan mode: list files to create or change, new dependencies, schema changes, risks and open questions. Wait for approval before editing.
2. An approved plan authorizes the files listed in it. Anything outside it needs a new approval.
3. STOP and ask before: adding a dependency, changing the schema, changing auth or authorization behaviour, touching money or claims logic, inventing a business rule, or leaving the approved architecture.
4. Never invent hospital policy. Flag undefined requirements in docs/requirements-register.md and ask.
5. Work on a branch named feature/<day-or-task>. Never commit to main. Never push without being asked. Never force-push.
6. After implementing, run the checks, then write docs/progress/day-XX.md (objective, completed, files, decisions, tests run with results, known issues, next). Update docs/STATUS.md.
7. Report real results. If a check fails or was not run, say so. Do not call a task complete without passing output.
8. Do not read or print .env files or secrets. Local dev only; never use production credentials.
9. Never run `prisma migrate reset`, `db push --force`, or destructive database commands without explicit approval in the same session.

## The developer
Victory runs Windows PowerShell. Give terminal instructions to him in PowerShell syntax (no bash-only commands). Keep explanations short and plain, bullets that start with a verb, and avoid buzzwords. He is a junior/intermediate TypeScript developer: prefer simple, readable code over clever abstractions.