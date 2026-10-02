# Day 7 — Authentication Backend

## Objective
Login, session cookie, authenticate middleware, facility selection, logout.

## Completed
- docs/auth-flow.md written before implementation
- Session model and migration add_sessions
- auth module: login, me, select-facility, logout
- authenticate and originCheck middleware, typed req.auth
- Login throttling per email and per IP

## Files Created
modules/auth/* (types, schemas, tokens, cookies, service, controller, routes), middleware/authenticate.ts, originCheck.ts, types/express.d.ts, docs/auth-flow.md

## Files Modified
config/env.ts, app.ts, prisma/schema.prisma, .env.example, docs/documentation-notes.md, docs/domain-model.md

## Dependencies Installed
jsonwebtoken, cookie-parser, express-rate-limit; dev: @types/jsonwebtoken, @types/cookie-parser

## Architecture Decisions
JWT carries session id only; active facility stored on session row; permissions read from DB each request; origin check plus SameSite=Lax; 8h absolute session

## Tests Performed
(record results of the 14 checks)

## Known Issues

## Deferred Work
Permission middleware (Day 9), password change/reset, lockout, idle timeout, login audit, session cleanup, cookie domain strategy for deployment

## Next Day
Day 8 — Authentication Frontend

## Git Commit
feat: add authentication backend with sessions and facility selection