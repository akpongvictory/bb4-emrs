# Day 4 — Database Foundation

## Objective
Create the initial Prisma schema and migration for identity and facility structure.

## Completed
- Prisma 7 set up with PostgreSQL
- Models: Facility, User, Department, FacilityMembership, Role, Permission, RolePermission, MembershipRole
- Migration init_identity_foundation applied

## Files Created
server/prisma.config.ts, server/prisma/schema.prisma, server/prisma/migrations/*, server/.env (not committed)

## Files Modified
server/package.json, server/.env.example, .gitignore, README.md, docs/documentation-notes.md

## Dependencies Installed
@prisma/client, @prisma/adapter-pg, pg, dotenv; dev: prisma, @types/pg

## Architecture Decisions
Facility-scoped roles via MembershipRole; isPlatformAdmin flag; UUID ids; Role.facilityId deferred; generated client in src/generated (ignored)

## Tests Performed
(record validate, migrate, status, \dt, typecheck, build results)

## Known Issues

## Deferred Work
Seed data (Day 5), custom roles, FacilitySettings

## Next Day
Day 5 — Seed Data

## Git Commit
feat: add identity and facility database foundation