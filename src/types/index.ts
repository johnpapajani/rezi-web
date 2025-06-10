export interface Language {
  code: string;
  name: string;
  flag: string;
}

export interface Translations {
  [key: string]: {
    [key: string]: string;
  };
}

export interface BusinessFeature {
  id: number;
  icon: string;
  title: string;
  description: string;
}

export interface Testimonial {
  id: number;
  name: string;
  business: string;
  avatar: string;
  rating: number;
  content: string;
}

export interface PricingPlan {
  id: number;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  popular?: boolean;
  cta: string;
}

export interface FAQ {
  id: number;
  question: string;
  answer: string;
}

// Authentication types
export interface User {
  id: string;
  email: string;
  phone?: string;
  locale: string;
  is_active: boolean;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user_id: string;
  email: string;
  phone?: string;
  locale: string;
  is_active: boolean;
}

export interface SignUpData {
  email: string;
  password: string;
  phone?: string;
  locale: string;
  is_active: boolean;
}

export interface SignInData {
  username: string; // email
  password: string;
}

export interface ApiError {
  detail: string;
}

export interface LogoutResponse {
  message: string;
}

// Business types
export interface Business {
  id: string;
  name: string;
  slug: string;
  currency: string;
  timezone: string;
  logo_url?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  postal_code?: string;
  country_code: string;
  created_at: string;
  updated_at: string;
}

export interface BusinessUpdate {
  name?: string;
  logo_url?: string;
  currency?: string;
  timezone?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  postal_code?: string;
}

// Business roles enum
export enum BusinessRole {
  owner = 'owner',
  manager = 'manager',
  employee = 'employee'
}

// Business with user role (for listing user's businesses)
export interface BusinessWithRole extends Business {
  role: BusinessRole;
} 