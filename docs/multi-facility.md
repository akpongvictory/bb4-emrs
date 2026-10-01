# Multi-Facility Architecture

Status: Day 3. Must be read before the Day 4 schema.

## Model

    User --< FacilityMembership >-- Facility

- One user may hold several memberships. Each membership has a role and a status.
- Every operational record carries facilityId.
- Patient numbers and other human-facing numbers are unique per facility: `(facilityId, number)`.

## Session

- Login identifies the user.
- One membership: enter that facility automatically.
- Several memberships: show a facility selector. Switching updates the active facility in the session.
- Changing facility re-checks the membership.

## Request rules

1. Take the active facility from the server-side session, never from the request body, query or URL.
2. Confirm an active membership for that facility on every request.
3. Authorize: collect the roles on the user's membership for that facility, combine their permissions, and check the route's required permission. Roles from other facilities are never considered.
4. Filter every query by facilityId through one shared helper.
5. Return 404 for records outside the active facility.

## Platform administration

- `User.isPlatformAdmin` (default false) marks a trusted BB4 platform administrator.
- The flag is read from the database on each request. The client can never supply or influence it.
- The flag grants no facility role or permission. A platform admin who needs clinical, billing or facility-admin powers in a facility holds them through a membership like any other user.
- Cross-facility platform functions (facility onboarding, platform configuration) check the flag explicitly on the backend and write audit records.

- Role held in Facility A does not grant access in Facility B for the same user.
- isPlatformAdmin alone does not open clinical, billing or claims data.
- isPlatformAdmin sent in a request body or header is ignored.