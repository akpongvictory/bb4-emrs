# Authentication Flow

Status: Day 7 (Oct 2, 2026). Implements the approved decisions: JWT in an httpOnly cookie, facility membership, backend-enforced authorization.

## Overview
A login creates a Session row in PostgreSQL and sends the browser a signed JWT in an httpOnly cookie. The JWT only says "this is session X". Everything else (who the user is, which facility is active, which roles apply) is read from the database on every request.

## Cookie
- Name: bb4_session. httpOnly (JavaScript cannot read it). Secure in production. SameSite=Lax. Path /.
- Expires with the session. Never stored in localStorage.

## Token
- HS256 JWT signed with JWT_SECRET (at least 32 characters).
- Claims: sub (user id), sid (session id), exp.
- Verification accepts HS256 only.

## Session
- Table Session: id, userId, activeFacilityId (nullable), createdAt, expiresAt, revokedAt.
- Lifetime: SESSION_TTL_HOURS (default 8), absolute. No idle timeout yet.
- Logout sets revokedAt. A revoked or expired session is rejected even if the cookie is replayed.
- Switching facility updates activeFacilityId on the session row. The cookie does not change.

## Endpoints
| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | /api/auth/login | no | Verify email and password, create session, set cookie |
| GET | /api/auth/me | yes | Return user, usable facilities, active facility with roles and permissions |
| POST | /api/auth/select-facility | yes | Switch active facility (membership checked) |
| POST | /api/auth/logout | no | Revoke session, clear cookie |

## Login steps
1. Validate body with Zod (email lowercased, password present).
2. Find user by email. Unknown or inactive user: hash a dummy password anyway (similar timing), then answer 401 INVALID_CREDENTIALS.
3. Verify the password with Argon2id. Wrong password: same 401, same message.
4. List active memberships in active facilities.
5. No memberships and not a platform admin: 403 NO_FACILITY_ACCESS, no session.
6. Create the session. Exactly one facility: select it. Several: leave activeFacilityId empty so the client shows the selector.
7. Set the cookie. Return user, facilities and active facility.

## Every authenticated request
1. Read the cookie, verify the JWT signature and expiry.
2. Load the session. Reject if missing, revoked or expired.
3. Load the user. Reject if inactive.
4. If activeFacilityId is set, load the user's membership for it. It must be active, in an active facility. Collect roles and combine their permissions.
5. If the membership is gone, the facility is treated as not selected (no permissions).
6. Attach req.auth: { sessionId, user, facility | null }.

The client never supplies facility id, roles, permissions or isPlatformAdmin as trusted values.

## Protection against forged requests
- Cookies are SameSite=Lax and no state change happens on GET.
- State-changing requests (anything except GET, HEAD, OPTIONS) that carry an Origin header must match CLIENT_ORIGIN, or they get 403 FORBIDDEN_ORIGIN. CLIENT_ORIGIN has no trailing slash.
- CORS allows only CLIENT_ORIGIN, with credentials.

## Login throttling
- Per email: 10 failed attempts per 15 minutes (successful logins are not counted).
- Per IP: 100 attempts per 15 minutes.
- In-memory, so each server instance counts separately. A shared store comes if the API runs on several instances.

## Deployment constraint
SameSite=Lax cookies only work when the frontend and API share a registrable domain (for example app.example.com and api.example.com), or when the hosting layer proxies /api to the backend. A Vercel domain talking to a Render domain would be cross-site, and browsers would drop the cookie. Decide before the first real deployment.

## Not in this day
Change/reset password, account lockout, idle timeout, login audit records (needs AuditLog), MFA, expired-session cleanup job.

## Error codes
UNAUTHENTICATED (401), INVALID_CREDENTIALS (401), NO_FACILITY_ACCESS (403), FACILITY_ACCESS_DENIED (403), FORBIDDEN_ORIGIN (403), TOO_MANY_ATTEMPTS (429), VALIDATION_ERROR (400).
