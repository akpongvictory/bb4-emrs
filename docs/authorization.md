# Authorization

## Model
User + Facility Membership + Role(s) + Permission + Resource. MVP resource scope: the active facility.

## How the backend enforces it
Every protected route runs `authenticate`, then `requirePermission("module.action")`.
1. authenticate: valid session and active user. Loads the active facility with roles and permissions from the database.
2. requirePermission: 403 FACILITY_NOT_SELECTED without an active facility. 403 PERMISSION_DENIED when the permission is not among the combined permissions of the user's roles in that facility.
3. Controllers call getFacilityAuth(req) and pass facility.id to services. Queries filter by that id. Client-supplied facility ids are ignored.

Route template:

    router.get("/", authenticate, requirePermission("patients.view"), listController);

## Rules
- Every route declares a permission. No route relies on the frontend.
- 401 means not signed in. 403 means signed in without permission or without a facility.
- isPlatformAdmin grants no facility permission. Platform functions get their own explicit check when they are built.
- All permission checks go through authorize(auth, permission, resource?). The resource argument is reserved for department, assigned-patient or specialty scopes, so callers do not change when scopes arrive.
- Denied attempts are logged (user, facility, permission, method, path). Request bodies are never logged.
- Small bounded configuration lists (departments, for example) return every row. Lists of clinical or financial records paginate.

## Frontend
- hasPermission() hides menu items and blocks pages. It is a convenience. The server decides.
- Navigation items live in client/src/layouts/navigation.ts, each with an optional permission.
- New module: add routes with requirePermission on the server, then its nav item and a RequirePermission route on the client.

## Checklist for every new endpoint
- authenticate and requirePermission present
- facility id taken from getFacilityAuth, never from the request
- tests: unauthenticated 401, wrong role 403, other facility's data never returned