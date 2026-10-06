export interface NavItem {
  label: string;
  to: string;
  // Menu item is shown only when the user has this permission. The server still enforces it.
  permission?: string;
}

export const navItems: NavItem[] = [
  { label: "Home", to: "/" },
  { label: "Facility", to: "/facility", permission: "facility.view" },
  { label: "Departments", to: "/departments", permission: "departments.view" },
];