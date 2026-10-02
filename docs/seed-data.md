# Seed Data

Run: `cd server; npm run db:seed` (safe to repeat; it updates instead of duplicating).
Refuses to run when NODE_ENV=production. Requires SEED_DEMO_PASSWORD in server/.env.
All demo users share that password. Re-seeding resets it to the current value.

Source of truth: server/prisma/seed-data.ts (permissions, roles, role-permission matrix, demo users).

## Facilities
- DEMO-A: Demo General Hospital (8 departments)
- DEMO-B: Demo Community Clinic (3 departments)

## Demo accounts
| Email | Facility and role |
|---|---|
| platform.admin@demo.bb4.test | Platform admin flag only, no membership |
| facility.admin@demo-a.bb4.test | A: Facility Admin |
| management@demo-a.bb4.test | A: Management |
| doctor@demo-a.bb4.test | A: Doctor |
| specialist@demo-a.bb4.test | A: Specialist |
| nurse@demo-a.bb4.test | A: Nurse |
| frontdesk@demo-a.bb4.test | A: Front Desk |
| records@demo-a.bb4.test | A: Records |
| lab@demo-a.bb4.test | A: Laboratory |
| radiology@demo-a.bb4.test | A: Radiology |
| pharmacy@demo-a.bb4.test | A: Pharmacy |
| billing@demo-a.bb4.test | A: Billing |
| claims@demo-a.bb4.test | A: HMO Claims |
| therapist@demo-a.bb4.test | A: Therapist |
| facility.admin@demo-b.bb4.test | B: Facility Admin |
| frontdesk@demo-b.bb4.test | B: Front Desk |
| multi.doctor@demo.bb4.test | A: Doctor; B: Doctor + Facility Admin |

## Starter permission matrix
Derived from Spec section 7 and the Oct 1 clarifications. Review before Day 9 enforcement.
- Facility Admin: facility, users (view, create, update, deactivate, assign_roles), departments, services, tariffs, payers, reports, audit, dashboard, encounter reopen. No clinical resources.
- Front Desk: patients (view, create, update), appointments, encounters (view, create), queue, payers (view), billing.view_status. No clinical notes or nursing notes.
- Nursing documentation is its own resource (nursing_notes). Doctors and Specialists can view it. Nurses write it and can view physician notes.