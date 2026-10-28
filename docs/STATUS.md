# BB4 EMRs Status

Last updated: Oct 28, 2026

## Done and committed (main at 11e6bd7)
Days 1-9: repo, TypeScript toolchain, Prisma schema (identity, facilities, sessions), seed data (13 roles, 82 permissions planned, 2 demo facilities, 17 demo users), Express foundation, cookie-JWT auth with facility selection, login UI, permission enforcement on facilities and departments, role-aware navigation.

## Unconfirmed
Day 9A Part 1 (user management backend): code was written but its application and test results have not been confirmed. First task is an audit (see below).
Expected after it: migration add_password_flag_and_audit_log, users module, POST /auth/change-password, AuditLog table, seed totals 82 permissions and 172 role permissions.

## Next steps, in order
1. Audit: compare repo to this file, run typechecks and builds, report. Read-only.
2. Finish and verify Day 9A Part 1.
3. Day 9A Part 2: client screens (staff list, add staff with one-time temporary password panel, staff detail with roles/department/deactivate/reactivate/reset password, forced change-password page, mustChangePassword handling in the auth context, nav item for users.view).
4. Day 10: facility isolation tests (decide a test runner and ask first).
5. Day 11: foundation checkpoint. Day 11A: early deployment smoke test (see docs/development-plan.md).
6. Then Phase 1 Week 2: patient model and registration.

## Decisions log
- Auth: JWT in httpOnly cookie, session row in the database, facility on the session, permissions read each request.
- Roles per FacilityMembership, system-defined; isPlatformAdmin flag on User grants no facility permission.
- UUID internal ids; human-facing numbers separate (patient number like BB4-000001 per facility).
- Duplicate patients: hard block on hospital number or approved national id; warn on phone or name plus date of birth.
- Encounter clinical, financial and claim statuses are separate; closing does not require full payment.
- allowFreeTextDiagnosis is a facility setting enforced on the backend.
- Currency is facility config (NGN initially). Payment methods are facility reference data.
- HMO CSV/XLSX import stays in the MVP with per-HMO column mapping.
- Files go through a storage service (local in dev, object storage in production).
- Passwords: Argon2id. Policy: 10 to 128 characters, different from current.
- Onboarding: temporary password, forced change at first login, no email provider yet.
- Physician notes and nursing notes are separate resources; no automatic cross-access.
- Resource scope for the MVP is the active facility; authorize() keeps a reserved resource argument.
- Deployment direction: GitHub, Vercel (frontend), Render or Railway (backend), managed PostgreSQL. No Docker.
- Cookie caveat: SameSite=Lax needs frontend and API on one registrable domain or an /api proxy. Decide before first deployment.

## Open items
- Facility onboarding (create a facility and its first Facility Admin) is unscheduled; needs platform admin functions.
- Adding an existing person to a second facility is unbuilt.
- AuditLog exists from Day 9A; full audit trail is Day 80.
- Password reset email flow is future.
- Test runner not chosen.

## Environment
Windows, PowerShell, repo at C:\Users\HP\Desktop\bb4-emrs, PostgreSQL local database bb4_emrs.
Demo password is SEED_DEMO_PASSWORD in server/.env. Demo accounts: docs/seed-data.md.