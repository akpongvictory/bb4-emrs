export interface FacilityProfile {
  id: string;
  name: string;
  code: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  logoUrl: string | null;
  currencyCode: string;
}

export interface Department {
  id: string;
  name: string;
  isActive: boolean;
}