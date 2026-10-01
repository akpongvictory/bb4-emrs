



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
- Facility.currencyCode defaults to "NGN" as the initial facility currency. FacilitySettings (free-text diagnosis, patient number format, payment methods) arrives in a later module.