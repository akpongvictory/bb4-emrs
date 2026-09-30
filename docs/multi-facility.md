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
3. Authorize against the role of that membership.
4. Filter every query by facilityId through one shared helper.
5. Return 404 for records outside the active facility.

## Platform administration

- Platform admins are distinct from facility admins.
- Platform admins reach other facilities only through named platform functions (onboarding, configuration), each audited.

## Tests required (Day 10)

- User from Facility A requests Facility B records: 404 on every module.
- Client sends a forged facility ID: ignored.
- Removed or inactive membership: access denied on the next request.
- Users with two memberships see only the active facility's data.