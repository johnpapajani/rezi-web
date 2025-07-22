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
  detail: string | object | any[];
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

// Business creation (matches backend BusinessCreate schema)
export interface BusinessCreate {
  name: string;
  slug: string;
  currency?: string;
  timezone?: string;
  logo_url?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  postal_code?: string;
  country_code?: string;
}

// Service types
export interface Service {
  id: string;
  business_id: string;
  name: string;
  slug: string;
  description?: string;
  duration_min: number;
  price_minor: number; // Price in minor currency units (e.g., cents)
  category_id?: string;
  capacity?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// New service open interval types matching backend schema
export enum Weekday {
  monday = 1,
  tuesday = 2,
  wednesday = 3,
  thursday = 4,
  friday = 5,
  saturday = 6,
  sunday = 7
}

export interface ServiceOpenInterval {
  id: string;
  service_id: string;
  weekday: Weekday;
  start_time: string; // HH:MM format
  end_time: string;   // HH:MM format
  notes?: string;
}

export interface ServiceOpenIntervalCreate {
  weekday: Weekday;
  start_time: string; // HH:MM format
  end_time: string;   // HH:MM format
  notes?: string;
}

export interface ServiceWithOpenIntervals extends Service {
  open_intervals: ServiceOpenInterval[];
}

// Legacy types for backward compatibility during migration
export interface ServiceHours {
  id?: string;
  service_id?: string;
  day_of_week: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  opens_at: string; // Time in HH:MM format (24h)
  closes_at: string; // Time in HH:MM format (24h)
  is_closed: boolean; // True if closed on this day
}

export interface ServiceCreate {
  name: string;
  slug: string;
  description?: string;
  duration_min: number;
  price_minor: number;
  is_active?: boolean;
  open_intervals?: ServiceOpenIntervalCreate[];
}

export interface ServiceUpdate {
  name?: string;
  slug?: string;
  description?: string;
  duration_min?: number;
  price_minor?: number;
  is_active?: boolean;
  category_id?: string;
  capacity?: number;
}

export interface ServiceWithTables extends ServiceWithOpenIntervals {
  tables: Table[];
  table_count: number;
}

// Availability types
export interface AvailabilitySlot {
  starts_at: string;
  ends_at: string;
  available_tables: number;
}

export interface AvailabilityMatrix {
  slots: AvailabilitySlot[];
}

// Booking types
export enum BookingStatus {
  pending = 'pending',
  confirmed = 'confirmed',
  cancelled = 'cancelled',
  completed = 'completed',
  no_show = 'no_show',
  rescheduled = 'rescheduled'
}

export interface Booking {
  id: string;
  business_id: string;
  starts_at: string;
  ends_at: string;
  party_size: number;
  status: BookingStatus;
  service_id?: string;
  customer_name: string;
  customer_phone?: string;
  customer_email?: string;
  created_at: string;
  updated_at: string;
}

export interface BookingWithService extends Booking {
  service_name?: string;
  service_duration_min?: number;
  service_price_minor?: number;
  table_code?: string;
  table_seats?: number;
}

export interface BookingUpdate {
  starts_at?: string;
  ends_at?: string;
  party_size?: number;
  status?: BookingStatus;
  service_id?: string;
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
}

export interface BookingFilters {
  date_from?: string;
  date_to?: string;
  status?: BookingStatus;
  service_id?: string;
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  party_size_min?: number;
  party_size_max?: number;
  created_from?: string;
  created_to?: string;
  limit?: number;
  offset?: number;
}

export interface BookingStatusUpdate {
  status: BookingStatus;
  reason?: string;
}

export interface BookingReschedule {
  new_starts_at: string;
  new_ends_at?: string;
  reason?: string;
}

export interface BookingCreateCustomer {
  name: string;
  phone?: string;
  email?: string;
}

export interface BookingCreate {
  service_id: string;
  table_id: string;
  starts_at: string;
  ends_at: string;
  party_size: number;
  customer: BookingCreateCustomer;
}

export interface DailyBookingSummary {
  date: string;
  total_bookings: number;
  confirmed_bookings: number;
  cancelled_bookings: number;
  completed_bookings: number;
  revenue_minor: number;
  average_party_size: number;
}

export interface BookingAnalytics {
  total_bookings: number;
  confirmed_bookings: number;
  cancelled_bookings: number;
  completed_bookings: number;
  no_show_bookings: number;
  pending_bookings: number;
  total_revenue_minor: number;
  average_party_size: number;
  most_popular_service?: string;
  busiest_day?: string;
  busiest_hour?: number;
}

// Table types
export interface Table {
  id: string;
  business_id: string;
  service_id: string;
  code: string;
  seats: number;
  merge_group?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TableCreate {
  service_id: string;
  code: string;
  seats: number;
  merge_group?: string;
  is_active?: boolean;
}

export interface TableUpdate {
  service_id?: string;
  code?: string;
  seats?: number;
  merge_group?: string;
  is_active?: boolean;
}

// Resource types
export interface Resource {
  id: string;
  business_id: string;
  code: string;
  seats: number;
  merge_group?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ResourceCreate {
  code: string;
  seats: number;
  merge_group?: string;
  is_active?: boolean;
}

export interface ResourceUpdate {
  code?: string;
  seats?: number;
  merge_group?: string;
  is_active?: boolean;
} 