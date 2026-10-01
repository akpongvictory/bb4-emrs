# Day 5 — Seed Data

## Objective
Create repeatable seed data: permissions, roles, demo facilities, departments, users.

## Completed
- Idempotent seed script with production guard
- 73 permissions, 13 system roles, starter role-permission matrix
- 2 demo facilities, 17 demo users including a multi-facility doctor and a platform admin

## Files Created
server/prisma/seed-data.ts, seed.ts, tsconfig.json; docs/seed-data.md

## Files Modified
server/package.json, prisma.config.ts, .env.example; (docs/documentation-notes.md if edited)

## Dependencies Installed
bcryptjs

## Architecture Decisions
Seed file is source of truth for system roles; platform admin has no membership; demo password from SEED_DEMO_PASSWORD

## Tests Performed
(record typecheck, two seed runs, Studio checks)

## Known Issues

## Deferred Work
Matrix review before Day 9; password policy and login (Day 7)

## Next Day
Day 6 — Backend Application Foundation

## Git Commit
feat: add seed data for roles, permissions, demo facilities and users