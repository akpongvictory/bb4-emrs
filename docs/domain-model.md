# BB4 EMRs Domain Model

Status: Day 3. Entities follow Spec section 34. Fields are designed on each module's schema day.

## 1. Principles

- Give every operational record a facility owner.
- Generate internal IDs separate from human-facing numbers (patient number, receipt number, claim number).
- Cancel or reverse clinical and financial records instead of deleting them. Audit every such action.
- Keep charge, invoice, payment, balance, adjustment and refund as separate records.
- Store money as fixed-precision decimals. Calculate on the server only.
- Write audit records for important create, update, cancel and reverse actions.

## 2. Domains and entities

| Domain | Entities | Scope |
|---|---|---|
| Identity | Facility, User, FacilityMembership, Role, Permission, RolePermission, Department | Facility and Permission are platform-level. Membership, Department are facility-owned. Role scope to confirm. |
| Patient | Patient, PatientIdentifier, PatientContact, PatientAlert | Facility-owned |
| Encounter | Encounter, Appointment, QueueEntry, Vital, ClinicalNote | Facility-owned |
| Clinical | Diagnosis, DiagnosisCode, Prescription, PrescriptionItem, Procedure, Referral | DiagnosisCode is a platform-level reference. Others facility-owned. |
| Diagnostics | LabOrder, LabOrderItem, LabResult, ImagingOrder, ImagingReport | Facility-owned |
| Pharmacy | Medication, MedicationProduct, StockItem, StockTransaction, Dispensing, DispensingItem | Facility-owned |
| Catalog | ServiceCategory, Service, FacilityService | Facility-owned |
| Billing | Tariff, Charge, Invoice, InvoiceItem, Payment, PaymentMethod, Adjustment, Refund | Facility-owned |
| Payer | Payer, Enrollee, Authorization, Claim, ClaimItem, ImportMapping, ImportBatch | Facility-owned |
| Audit | AuditLog | Facility-owned, append-only |
| Configuration | FacilitySettings (currency, free-text diagnosis, patient number format, enabled modules, payment methods) | Facility-owned |
| Files | Document (metadata only) | Facility-owned |

## 3. Key relationships

- Facility has many memberships, departments, patients, services, tariffs, payers, settings.
- User has many FacilityMemberships. Each membership carries one role for one facility.
- Patient belongs to one facility and has many encounters. The same real person registered at two facilities is two Patient records.
- Encounter belongs to a patient and a facility. It has appointments, queue entries, vitals, notes, diagnoses, orders, prescriptions, procedures, referrals and charges.
- Orders and prescriptions belong to an encounter. Results and dispensing records belong to their order or prescription.
- Service has Tariffs (private price and payer-specific prices, with effective dates).
- Charge references an encounter and a service or item. Invoices group charges. Payments apply to invoices or charges.
- Claim references a payer, an encounter and its claim items.
- Payer carries a configurable type (Private HMO, NHIA/PLASCHEMA, Other). Payer rules stay in data.
- Document links to a patient and, where applicable, an encounter or record.

## 4. Three separate status tracks

| Track | Lives on | Example values (final lists set on each module's day) |
|---|---|---|
| Clinical | Encounter | OPEN, CLOSED |
| Financial | Derived from charges, payments, adjustments | UNBILLED, UNPAID, PARTIALLY_PAID, PAID |
| Claim | Claim | DRAFT, PREPARED, SUBMITTED, PENDING, APPROVED, REJECTED, EXCEPTION, SETTLED |

- Allow closure of an encounter with a balance or pending claim.
- Require a permission to close or reopen. Audit reopening.

## 5. Identity model

    User --< FacilityMembership >-- Facility
                   |
                  Role --< RolePermission >-- Permission

## 6. Audit record

Fields: facilityId, userId, action, entityType, entityId, timestamp, change summary, old value, new value. Ordinary users cannot edit or delete audit records.

## 7. Items to settle at schema time

- Role scope (system-wide vs facility-specific).
- Internal ID type.
- Payment allocation rules (Days 64 to 67).
- Whether to reserve source-system fields for future legacy migration (Spec section 30.15).