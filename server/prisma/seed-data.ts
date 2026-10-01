// Reference and demo data for development.
// Never put real patient or staff data in this file.

// Every permission is "<module>.<action>".
export const permissionGroups: Record<string, string[]> = {
  facility: ["view", "manage"],
  users: ["view", "manage"],
  departments: ["view", "manage"],
  patients: ["view", "create", "update"],
  appointments: ["view", "create", "update"],
  encounters: ["view", "create", "update", "close", "reopen"],
  queue: ["view", "manage"],
  vitals: ["view", "create", "update"],
  clinical_notes: ["view", "create", "update"],
  diagnoses: ["view", "create", "update"],
  orders: ["view", "create", "cancel"],
  prescriptions: ["view", "create", "cancel"],
  laboratory: ["view", "update_status", "enter_result", "release_result", "correct_result"],
  imaging: ["view", "update_status", "report"],
  pharmacy: ["view", "review", "dispense", "manage_stock"],
  procedures: ["view", "create", "update"],
  referrals: ["view", "create", "update"],
  services: ["view", "manage"],
  tariffs: ["view", "manage"],
  billing: ["view", "create_charge", "receive_payment", "adjust", "reverse"],
  payers: ["view", "manage"],
  claims: ["view", "create", "update", "submit", "import"],
  reports: ["view", "revenue", "export"],
  audit: ["view"],
  dashboard: ["view"],
};

// "*" means every action of that module.
export type Grants = Record<string, string[] | "*">;

export interface RoleSeed {
  key: string;
  name: string;
  description: string;
  grants: Grants;
}

// STARTER MATRIX, derived from Spec section 7. Review before relying on it.
export const roles: RoleSeed[] = [
  {
    key: "facility_admin",
    name: "Facility Admin",
    description: "Facility configuration, users, departments, services, tariffs, reports and administration.",
    grants: {
      facility: "*", users: "*", departments: "*", services: "*", tariffs: "*", payers: "*",
      encounters: ["reopen"],
      reports: "*", audit: ["view"], dashboard: ["view"],
    },
  },
  {
    key: "management",
    name: "Management",
    description: "Dashboards, revenue and operational reports, permitted audit information.",
    grants: {
      facility: ["view"], dashboard: ["view"], reports: "*", audit: ["view"],
    },
  },
  {
    key: "doctor",
    name: "Doctor / Medical Officer",
    description: "Consultations, diagnoses, orders, prescriptions, referrals and procedures.",
    grants: {
      patients: ["view"], appointments: ["view"], encounters: ["view", "update", "close"],
      queue: ["view"], vitals: ["view"], clinical_notes: "*", diagnoses: "*",
      orders: "*", prescriptions: "*", laboratory: ["view"], imaging: ["view"],
      procedures: "*", referrals: "*",
    },
  },
  {
    key: "specialist",
    name: "Specialist / Consultant",
    description: "Clinical access appropriate to specialty and assigned workflows.",
    grants: {
      patients: ["view"], appointments: ["view"], encounters: ["view", "update", "close"],
      queue: ["view"], vitals: ["view"], clinical_notes: "*", diagnoses: "*",
      orders: "*", prescriptions: "*", laboratory: ["view"], imaging: ["view"],
      procedures: "*", referrals: "*",
    },
  },
  {
    key: "nurse",
    name: "Nurse",
    description: "Vitals, nursing notes, queues and permitted clinical information.",
    grants: {
      patients: ["view"], appointments: ["view"], encounters: ["view", "update"],
      queue: "*", vitals: "*", clinical_notes: ["view", "create"],
      orders: ["view"], prescriptions: ["view"], procedures: ["view"],
    },
  },
  {
    key: "front_desk",
    name: "Front Desk",
    description: "Registration, patient search, appointments, encounter creation and queue.",
    grants: {
      patients: ["view", "create", "update"], appointments: "*",
      encounters: ["view", "create"], queue: "*", payers: ["view"],
    },
  },
  {
    key: "records",
    name: "Records Officer",
    description: "Patient record administration and permitted documentation functions.",
    grants: {
      patients: "*", encounters: ["view"], clinical_notes: ["view"],
      diagnoses: ["view"], referrals: ["view"], appointments: ["view"],
    },
  },
  {
    key: "laboratory",
    name: "Laboratory",
    description: "Lab orders, sample workflow, results and permitted patient context.",
    grants: { patients: ["view"], orders: ["view"], laboratory: "*" },
  },
  {
    key: "radiology",
    name: "Radiology / Imaging",
    description: "Imaging orders, workflow, reports and permitted attachments.",
    grants: { patients: ["view"], orders: ["view"], imaging: "*" },
  },
  {
    key: "pharmacy",
    name: "Pharmacist",
    description: "Prescriptions, dispensing, stock and pharmacy records.",
    grants: { patients: ["view"], prescriptions: ["view"], pharmacy: "*" },
  },
  {
    key: "billing",
    name: "Billing / Cashier",
    description: "Charges, invoices, payments, receipts and balances.",
    grants: {
      patients: ["view"], encounters: ["view"], billing: "*", services: ["view"],
      tariffs: ["view"], payers: ["view"], reports: ["view"],
    },
  },
  {
    key: "hmo_claims",
    name: "HMO / Claims Officer",
    description: "Payer details, authorization, tariffs, claim records and claim workflow.",
    grants: {
      patients: ["view"], encounters: ["view"], payers: "*", tariffs: ["view"],
      claims: "*", billing: ["view"], reports: ["view"],
    },
  },
  {
    key: "therapist",
    name: "Therapist",
    description: "Support-unit sessions (physiotherapy, nutrition and similar).",
    grants: {
      patients: ["view"], appointments: ["view"], encounters: ["view", "update"],
      queue: ["view"], vitals: ["view"], clinical_notes: ["view", "create"],
      procedures: ["view", "create", "update"], referrals: ["view"],
    },
  },
];

export interface FacilitySeed {
  code: string;
  name: string;
  departments: string[];
}

export const demoFacilities: FacilitySeed[] = [
  {
    code: "DEMO-A",
    name: "Demo General Hospital",
    departments: [
      "OPD", "Laboratory", "Radiology", "Pharmacy",
      "Theatre", "Physiotherapy", "Immunisation", "Nutrition",
    ],
  },
  {
    code: "DEMO-B",
    name: "Demo Community Clinic",
    departments: ["OPD", "Laboratory", "Pharmacy"],
  },
];

export interface MembershipSeed {
  facilityCode: string;
  roles: string[];
  department?: string;
}

export interface UserSeed {
  email: string;
  firstName: string;
  lastName: string;
  isPlatformAdmin?: boolean;
  memberships: MembershipSeed[];
}

// One demo user per role in Facility A.
const facilityAStaff = [
  { local: "facility.admin", role: "facility_admin", label: "Facility Admin" },
  { local: "management", role: "management", label: "Management" },
  { local: "doctor", role: "doctor", label: "Doctor", department: "OPD" },
  { local: "specialist", role: "specialist", label: "Specialist", department: "OPD" },
  { local: "nurse", role: "nurse", label: "Nurse", department: "OPD" },
  { local: "frontdesk", role: "front_desk", label: "Front Desk", department: "OPD" },
  { local: "records", role: "records", label: "Records" },
  { local: "lab", role: "laboratory", label: "Laboratory", department: "Laboratory" },
  { local: "radiology", role: "radiology", label: "Radiology", department: "Radiology" },
  { local: "pharmacy", role: "pharmacy", label: "Pharmacy", department: "Pharmacy" },
  { local: "billing", role: "billing", label: "Billing" },
  { local: "claims", role: "hmo_claims", label: "HMO Claims" },
  { local: "therapist", role: "therapist", label: "Therapist", department: "Physiotherapy" },
];

export const demoUsers: UserSeed[] = [
  // Platform admin: no facility membership, so no facility permissions by itself.
  {
    email: "platform.admin@demo.bb4.test",
    firstName: "Demo",
    lastName: "Platform Admin",
    isPlatformAdmin: true,
    memberships: [],
  },
  ...facilityAStaff.map((staff) => ({
    email: `${staff.local}@demo-a.bb4.test`,
    firstName: "Demo",
    lastName: staff.label,
    memberships: [
      { facilityCode: "DEMO-A", roles: [staff.role], department: staff.department },
    ],
  })),
  // Facility B users.
  {
    email: "facility.admin@demo-b.bb4.test",
    firstName: "Demo",
    lastName: "Facility Admin (B)",
    memberships: [{ facilityCode: "DEMO-B", roles: ["facility_admin"] }],
  },
  {
    email: "frontdesk@demo-b.bb4.test",
    firstName: "Demo",
    lastName: "Front Desk (B)",
    memberships: [{ facilityCode: "DEMO-B", roles: ["front_desk"], department: "OPD" }],
  },
  // One person in both facilities with different roles in each.
  {
    email: "multi.doctor@demo.bb4.test",
    firstName: "Demo",
    lastName: "Multi-Facility Doctor",
    memberships: [
      { facilityCode: "DEMO-A", roles: ["doctor"], department: "OPD" },
      { facilityCode: "DEMO-B", roles: ["doctor", "facility_admin"], department: "OPD" },
    ],
  },
];