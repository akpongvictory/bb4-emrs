## Frontend behaviour (Day 8)
- The app never sees or stores the token. The browser holds the httpOnly cookie, and every request uses credentials: "include".
- On startup the app calls GET /auth/me. 401 means signed out. Any other failure shows an error screen with a retry button.
- Route guards: RequireAuth (signed in), RequireFacility (facility chosen, else the facility selector).
- A 401 UNAUTHENTICATED response from any API call clears the local session and returns the user to the login screen.
- Hidden menus are convenience only. The backend enforces every permission.
- Accounts with no facility (platform admin) see a "No facility access" screen until platform screens exist.

# Day 8 — Authentication Frontend

## Objective
Login page, auth state, protected routes, facility selection, logout.

## Completed
- Tailwind 4 and React Router installed and configured
- apiClient with ApiError and unauthorized handling; authService
- AuthContext, AuthProvider, useAuth
- LoginPage, SelectFacilityPage, RouteGuards, AppLayout, HomePage, NotFoundPage

## Files Created
types/auth.ts, services/apiClient.ts, authService.ts, context/AuthContext.ts, AuthProvider.tsx, hooks/useAuth.ts, components/FullPageMessage.tsx, NotFoundPage.tsx, features/auth/*, features/home/HomePage.tsx, layouts/AppLayout.tsx

## Files Modified
App.tsx, main.tsx, vite.config.ts, index.css, vite-env.d.ts, index.html, docs/auth-flow.md

## Dependencies Installed
react-router, tailwindcss, @tailwindcss/vite

## Architecture Decisions
Token never reaches JavaScript; session loaded from /auth/me; guards via route components; hasPermission is UI convenience only

## Tests Performed
(record the 11 UI checks and any Day 7 backend checks run)

## Known Issues

## Deferred Work
Permission middleware and role-aware navigation (Day 9), mustChangePassword screen (Day 9A), platform admin screens

## Next Day
Day 9 — Role & Permission Enforcement

## Git Commit
feat: add authentication frontend with protected routes