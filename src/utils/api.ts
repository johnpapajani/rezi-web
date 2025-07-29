import { 
  User,
  AuthResponse, 
  SignUpData, 
  SignInData, 
  ApiError, 
  LogoutResponse,
  SendVerificationEmailResponse,
  VerifyEmailRequest,
  VerifyEmailResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  Business, 
  BusinessUpdate, 
  BusinessWithRole, 
  BusinessCreate, 
  QRCodeResponse, 
  Service, 
  ServiceCreate, 
  ServiceUpdate, 
  ServiceWithTables, 
  Booking, 
  BookingWithService, 
  BookingUpdate, 
  BookingFilters, 
  BookingStatusUpdate, 
  BookingReschedule, 
  BookingCreate, 
  DailyBookingSummary, 
  BookingAnalytics, 
  Table, 
  TableCreate, 
  TableUpdate, 
  Resource, 
  ResourceCreate, 
  ResourceUpdate, 
  ServiceWithOpenIntervals, 
  ServiceOpenInterval, 
  ServiceOpenIntervalCreate, 
  AvailabilityMatrix, 
  ServiceCategory, 
  ServiceCategoryLocalized 
} from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://0.0.0.0:8001';

class ApiErrorClass extends Error {
  constructor(public detail: string, public status?: number) {
    super(detail);
    this.name = 'ApiError';
  }
}

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    let errorMessage = 'An error occurred';
    try {
      const errorData: ApiError = await response.json();
      
      // Handle different types of error details
      if (errorData.detail) {
        if (Array.isArray(errorData.detail)) {
          // Handle validation errors array (like Pydantic validation errors)
          const validationErrors = errorData.detail.map((error: any) => {
            if (typeof error === 'string') {
              return error;
            }
            // Handle validation error objects with structure like {type, loc, msg, input, ctx, url}
            const field = error.loc && error.loc.length > 0 ? error.loc[error.loc.length - 1] : 'field';
            const message = error.msg || error.message || 'Invalid value';
            return `${field}: ${message}`;
          }).join(', ');
          errorMessage = `Validation errors: ${validationErrors}`;
        } else if (typeof errorData.detail === 'string') {
          errorMessage = errorData.detail;
        } else if (typeof errorData.detail === 'object') {
          // Handle single validation error object
          const detailObj = errorData.detail as any;
          if (detailObj.msg || detailObj.message) {
            const field = detailObj.loc && detailObj.loc.length > 0 
              ? detailObj.loc[detailObj.loc.length - 1] 
              : 'field';
            const message = detailObj.msg || detailObj.message;
            errorMessage = `${field}: ${message}`;
          } else {
            // Fallback for unknown object structures
            errorMessage = JSON.stringify(errorData.detail);
          }
        }
      }
    } catch {
      errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    }
    throw new ApiErrorClass(errorMessage, response.status);
  }
  
  return response.json();
};

export const authApi = {
  signUp: async (data: SignUpData): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    return handleResponse<AuthResponse>(response);
  },

  signIn: async (data: SignInData): Promise<AuthResponse> => {
    const formData = new FormData();
    formData.append('username', data.username);
    formData.append('password', data.password);

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      body: formData,
    });
    
    return handleResponse<AuthResponse>(response);
  },

  refreshToken: async (refreshToken: string): Promise<{ access_token: string; refresh_token: string; token_type: string }> => {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    
    return handleResponse(response);
  },

  logout: async (refreshToken: string, accessToken: string): Promise<LogoutResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    
    return handleResponse<LogoutResponse>(response);
  },

  sendVerificationEmail: async (accessToken: string): Promise<SendVerificationEmailResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/send-verification-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    
    return handleResponse<SendVerificationEmailResponse>(response);
  },

  verifyEmail: async (data: VerifyEmailRequest): Promise<VerifyEmailResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/verify-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    return handleResponse<VerifyEmailResponse>(response);
  },

  forgotPassword: async (data: ForgotPasswordRequest): Promise<ForgotPasswordResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    return handleResponse<ForgotPasswordResponse>(response);
  },

  resetPassword: async (data: ResetPasswordRequest): Promise<ResetPasswordResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    return handleResponse<ResetPasswordResponse>(response);
  },
};

// Token management utilities
export const tokenStorage = {
  getAccessToken: (): string | null => {
    return localStorage.getItem('access_token');
  },

  getRefreshToken: (): string | null => {
    return localStorage.getItem('refresh_token');
  },

  setTokens: (accessToken: string, refreshToken: string): void => {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
  },

  clearTokens: (): void => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },

  getUser: (): any | null => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  setUser: (user: any): void => {
    localStorage.setItem('user', JSON.stringify(user));
  },
};

// Business API functions
export const businessApi = {
  listUserBusinesses: async (): Promise<BusinessWithRole[]> => {
    const accessToken = tokenStorage.getAccessToken();
    if (!accessToken) {
      throw new ApiErrorClass('No access token available', 401);
    }

    const response = await fetch(`${API_BASE_URL}/business/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    
    return handleResponse<BusinessWithRole[]>(response);
  },

  createBusiness: async (businessData: BusinessCreate, generateQr: boolean = true): Promise<Business> => {
    const accessToken = tokenStorage.getAccessToken();
    if (!accessToken) {
      throw new ApiErrorClass('No access token available', 401);
    }

    const url = new URL(`${API_BASE_URL}/business/`);
    url.searchParams.set('generate_qr', generateQr.toString());

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(businessData),
    });
    
    return handleResponse<Business>(response);
  },

  getBusiness: async (bizId: string): Promise<Business> => {
    const accessToken = tokenStorage.getAccessToken();
    if (!accessToken) {
      throw new ApiErrorClass('No access token available', 401);
    }

    const response = await fetch(`${API_BASE_URL}/business/${bizId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    
    return handleResponse<Business>(response);
  },

  getQRCodeInfo: async (bizId: string, includeBase64: boolean = false): Promise<QRCodeResponse> => {
    const accessToken = tokenStorage.getAccessToken();
    if (!accessToken) {
      throw new ApiErrorClass('No access token available', 401);
    }

    const url = new URL(`${API_BASE_URL}/business/${bizId}/qr-code/info`);
    url.searchParams.set('include_base64', includeBase64.toString());

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    
    return handleResponse<QRCodeResponse>(response);
  },

  updateBusiness: async (bizId: string, businessUpdate: BusinessUpdate): Promise<Business> => {
    const accessToken = tokenStorage.getAccessToken();
    if (!accessToken) {
      throw new ApiErrorClass('No access token available', 401);
    }

    const response = await fetch(`${API_BASE_URL}/business/${bizId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(businessUpdate),
    });
    
    return handleResponse<Business>(response);
  },
};

// Service API functions
export const serviceApi = {
  getServiceCategories: async (language: string = 'en'): Promise<ServiceCategoryLocalized[]> => {
    const accessToken = tokenStorage.getAccessToken();
    if (!accessToken) {
      throw new ApiErrorClass('No access token available', 401);
    }

    const url = new URL(`${API_BASE_URL}/business/service-categories`);
    url.searchParams.set('include_translations', 'true');

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Accept-Language': language,
      },
    });
    
    return handleResponse<ServiceCategoryLocalized[]>(response);
  },

  getServices: async (bizId: string, activeOnly: boolean = true): Promise<ServiceWithTables[]> => {
    const accessToken = tokenStorage.getAccessToken();
    if (!accessToken) {
      throw new ApiErrorClass('No access token available', 401);
    }

    const url = new URL(`${API_BASE_URL}/business/${bizId}/services`);
    url.searchParams.set('active_only', activeOnly.toString());

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    
    return handleResponse<ServiceWithTables[]>(response);
  },

  getService: async (bizId: string, serviceId: string): Promise<Service> => {
    const accessToken = tokenStorage.getAccessToken();
    if (!accessToken) {
      throw new ApiErrorClass('No access token available', 401);
    }

    const response = await fetch(`${API_BASE_URL}/business/${bizId}/services/${serviceId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    
    return handleResponse<Service>(response);
  },

  createService: async (bizId: string, serviceData: ServiceCreate): Promise<Service> => {
    const accessToken = tokenStorage.getAccessToken();
    if (!accessToken) {
      throw new ApiErrorClass('No access token available', 401);
    }

    const response = await fetch(`${API_BASE_URL}/business/${bizId}/services`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(serviceData),
    });
    
    return handleResponse<Service>(response);
  },

  updateService: async (serviceId: string, serviceUpdate: ServiceUpdate): Promise<Service> => {
    const accessToken = tokenStorage.getAccessToken();
    if (!accessToken) {
      throw new ApiErrorClass('No access token available', 401);
    }

    const response = await fetch(`${API_BASE_URL}/services/${serviceId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(serviceUpdate),
    });
    
    return handleResponse<Service>(response);
  },

  deleteService: async (bizId: string, serviceId: string): Promise<void> => {
    const accessToken = tokenStorage.getAccessToken();
    if (!accessToken) {
      throw new ApiErrorClass('No access token available', 401);
    }

    const response = await fetch(`${API_BASE_URL}/business/${bizId}/services/${serviceId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new ApiErrorClass(errorData.detail || 'Failed to delete service', response.status);
    }
  },

  // Service-centric endpoints (using the service router)
  getServiceDetails: async (serviceId: string): Promise<ServiceWithOpenIntervals> => {
    const accessToken = tokenStorage.getAccessToken();
    if (!accessToken) {
      throw new ApiErrorClass('No access token available', 401);
    }

    const response = await fetch(`${API_BASE_URL}/services/${serviceId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    
    return handleResponse<ServiceWithOpenIntervals>(response);
  },

  updateServiceDetails: async (serviceId: string, serviceUpdate: ServiceUpdate): Promise<ServiceWithOpenIntervals> => {
    const accessToken = tokenStorage.getAccessToken();
    if (!accessToken) {
      throw new ApiErrorClass('No access token available', 401);
    }

    const response = await fetch(`${API_BASE_URL}/services/${serviceId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(serviceUpdate),
    });
    
    return handleResponse<ServiceWithOpenIntervals>(response);
  },

  // Service Open Intervals Management
  getServiceOpenIntervals: async (serviceId: string): Promise<ServiceOpenInterval[]> => {
    const accessToken = tokenStorage.getAccessToken();
    if (!accessToken) {
      throw new ApiErrorClass('No access token available', 401);
    }

    const response = await fetch(`${API_BASE_URL}/services/${serviceId}/open-intervals`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    
    return handleResponse<ServiceOpenInterval[]>(response);
  },

  replaceServiceOpenIntervals: async (serviceId: string, intervals: ServiceOpenIntervalCreate[]): Promise<void> => {
    const accessToken = tokenStorage.getAccessToken();
    if (!accessToken) {
      throw new ApiErrorClass('No access token available', 401);
    }

    const response = await fetch(`${API_BASE_URL}/services/${serviceId}/open-intervals`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(intervals),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new ApiErrorClass(errorData.detail || 'Failed to update service open intervals', response.status);
    }
  },

  getServiceTables: async (serviceId: string, activeOnly: boolean = true): Promise<Table[]> => {
    const accessToken = tokenStorage.getAccessToken();
    if (!accessToken) {
      throw new ApiErrorClass('No access token available', 401);
    }

    const url = new URL(`${API_BASE_URL}/services/${serviceId}/tables`);
    url.searchParams.set('active_only', activeOnly.toString());

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    
    return handleResponse<Table[]>(response);
  },

  addServiceTable: async (serviceId: string, tableData: TableCreate): Promise<Table> => {
    const accessToken = tokenStorage.getAccessToken();
    if (!accessToken) {
      throw new ApiErrorClass('No access token available', 401);
    }

    const response = await fetch(`${API_BASE_URL}/services/${serviceId}/tables`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tableData),
    });
    
    return handleResponse<Table>(response);
  },

  getServiceTable: async (serviceId: string, tableId: string): Promise<Table> => {
    const accessToken = tokenStorage.getAccessToken();
    if (!accessToken) {
      throw new ApiErrorClass('No access token available', 401);
    }

    const response = await fetch(`${API_BASE_URL}/services/${serviceId}/tables/${tableId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    
    return handleResponse<Table>(response);
  },

  updateServiceTable: async (serviceId: string, tableId: string, tableUpdate: TableUpdate): Promise<Table> => {
    const accessToken = tokenStorage.getAccessToken();
    if (!accessToken) {
      throw new ApiErrorClass('No access token available', 401);
    }

    const response = await fetch(`${API_BASE_URL}/services/${serviceId}/tables/${tableId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tableUpdate),
    });
    
    return handleResponse<Table>(response);
  },

  getServiceBookings: async (serviceId: string, filters?: any): Promise<BookingWithService[]> => {
    const accessToken = tokenStorage.getAccessToken();
    if (!accessToken) {
      throw new ApiErrorClass('No access token available', 401);
    }

    const url = new URL(`${API_BASE_URL}/services/${serviceId}/bookings`);
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          url.searchParams.append(key, value.toString());
        }
      });
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    
    return handleResponse<BookingWithService[]>(response);
  },

  createServiceBooking: async (serviceId: string, bookingData: BookingCreate): Promise<BookingWithService> => {
    const accessToken = tokenStorage.getAccessToken();
    if (!accessToken) {
      throw new ApiErrorClass('No access token available', 401);
    }

    const response = await fetch(`${API_BASE_URL}/services/${serviceId}/bookings`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingData),
    });
    
    return handleResponse<BookingWithService>(response);
  },

  getServiceBooking: async (serviceId: string, bookingId: string): Promise<BookingWithService> => {
    const accessToken = tokenStorage.getAccessToken();
    if (!accessToken) {
      throw new ApiErrorClass('No access token available', 401);
    }

    const response = await fetch(`${API_BASE_URL}/services/${serviceId}/bookings/${bookingId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    
    return handleResponse<BookingWithService>(response);
  },

  updateServiceBooking: async (serviceId: string, bookingId: string, bookingUpdate: BookingUpdate): Promise<BookingWithService> => {
    const accessToken = tokenStorage.getAccessToken();
    if (!accessToken) {
      throw new ApiErrorClass('No access token available', 401);
    }

    const response = await fetch(`${API_BASE_URL}/services/${serviceId}/bookings/${bookingId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingUpdate),
    });
    
    return handleResponse<BookingWithService>(response);
  },

  updateServiceBookingStatus: async (serviceId: string, bookingId: string, statusUpdate: BookingStatusUpdate): Promise<BookingWithService> => {
    const accessToken = tokenStorage.getAccessToken();
    if (!accessToken) {
      throw new ApiErrorClass('No access token available', 401);
    }

    const response = await fetch(`${API_BASE_URL}/services/${serviceId}/bookings/${bookingId}/status`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(statusUpdate),
    });
    
    return handleResponse<BookingWithService>(response);
  },

  getServiceAvailability: async (serviceId: string, date: string, partySize: number, tableId?: string): Promise<AvailabilityMatrix> => {
    const accessToken = tokenStorage.getAccessToken();
    if (!accessToken) {
      throw new ApiErrorClass('No access token available', 401);
    }

    const url = new URL(`${API_BASE_URL}/services/${serviceId}/availability`);
    url.searchParams.set('date_', date);
    url.searchParams.set('party_size', partySize.toString());
    if (tableId) {
      url.searchParams.set('table_id', tableId);
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    
    return handleResponse<AvailabilityMatrix>(response);
  },
};

// Booking API functions
export const bookingApi = {
  searchBookings: async (bizId: string, filters?: BookingFilters): Promise<BookingWithService[]> => {
    const accessToken = tokenStorage.getAccessToken();
    if (!accessToken) {
      throw new ApiErrorClass('No access token available', 401);
    }

    const searchParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, value.toString());
        }
      });
    }

    const url = `${API_BASE_URL}/business/${bizId}/bookings/search${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    
    return handleResponse<BookingWithService[]>(response);
  },

  getCalendarBookings: async (bizId: string, dateFrom?: string, dateTo?: string): Promise<BookingWithService[]> => {
    const accessToken = tokenStorage.getAccessToken();
    if (!accessToken) {
      throw new ApiErrorClass('No access token available', 401);
    }

    const searchParams = new URLSearchParams();
    if (dateFrom) searchParams.append('date_from', dateFrom);
    if (dateTo) searchParams.append('date_to', dateTo);

    const url = `${API_BASE_URL}/business/${bizId}/bookings/calendar${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    
    return handleResponse<BookingWithService[]>(response);
  },

  getUpcomingBookings: async (bizId: string, daysAhead: number = 7, limit: number = 20): Promise<BookingWithService[]> => {
    const accessToken = tokenStorage.getAccessToken();
    if (!accessToken) {
      throw new ApiErrorClass('No access token available', 401);
    }

    const searchParams = new URLSearchParams();
    searchParams.append('days_ahead', daysAhead.toString());
    searchParams.append('limit', limit.toString());

    const response = await fetch(`${API_BASE_URL}/business/${bizId}/bookings/upcoming?${searchParams.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    
    return handleResponse<BookingWithService[]>(response);
  },

  getBookingDetails: async (bizId: string, bookingId: string): Promise<BookingWithService> => {
    const accessToken = tokenStorage.getAccessToken();
    if (!accessToken) {
      throw new ApiErrorClass('No access token available', 401);
    }

    const response = await fetch(`${API_BASE_URL}/business/${bizId}/bookings/${bookingId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    
    return handleResponse<BookingWithService>(response);
  },

  updateBooking: async (bizId: string, bookingId: string, bookingUpdate: BookingUpdate): Promise<BookingWithService> => {
    const accessToken = tokenStorage.getAccessToken();
    if (!accessToken) {
      throw new ApiErrorClass('No access token available', 401);
    }

    const response = await fetch(`${API_BASE_URL}/business/${bizId}/bookings/${bookingId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingUpdate),
    });
    
    return handleResponse<BookingWithService>(response);
  },

  updateBookingStatus: async (bizId: string, bookingId: string, statusUpdate: BookingStatusUpdate): Promise<BookingWithService> => {
    const accessToken = tokenStorage.getAccessToken();
    if (!accessToken) {
      throw new ApiErrorClass('No access token available', 401);
    }

    const response = await fetch(`${API_BASE_URL}/business/${bizId}/bookings/${bookingId}/status`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(statusUpdate),
    });
    
    return handleResponse<BookingWithService>(response);
  },

  rescheduleBooking: async (bizId: string, bookingId: string, rescheduleData: BookingReschedule): Promise<BookingWithService> => {
    const accessToken = tokenStorage.getAccessToken();
    if (!accessToken) {
      throw new ApiErrorClass('No access token available', 401);
    }

    const response = await fetch(`${API_BASE_URL}/business/${bizId}/bookings/${bookingId}/reschedule`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(rescheduleData),
    });
    
    return handleResponse<BookingWithService>(response);
  },

  cancelBooking: async (bizId: string, bookingId: string): Promise<void> => {
    const accessToken = tokenStorage.getAccessToken();
    if (!accessToken) {
      throw new ApiErrorClass('No access token available', 401);
    }

    const response = await fetch(`${API_BASE_URL}/business/${bizId}/bookings/${bookingId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new ApiErrorClass(errorData.detail || 'Failed to cancel booking', response.status);
    }
  },
};

// Table API functions
export const tableApi = {
  getTables: async (bizId: string, serviceId?: string): Promise<Table[]> => {
    const accessToken = tokenStorage.getAccessToken();
    if (!accessToken) {
      throw new ApiErrorClass('No access token available', 401);
    }

    const url = serviceId 
      ? `${API_BASE_URL}/business/${bizId}/services/${serviceId}/tables`
      : `${API_BASE_URL}/business/${bizId}/tables`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    
    return handleResponse<Table[]>(response);
  },

  getTable: async (bizId: string, tableId: string): Promise<Table> => {
    const accessToken = tokenStorage.getAccessToken();
    if (!accessToken) {
      throw new ApiErrorClass('No access token available', 401);
    }

    const response = await fetch(`${API_BASE_URL}/business/${bizId}/tables/${tableId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    
    return handleResponse<Table>(response);
  },

  createTable: async (bizId: string, tableData: TableCreate): Promise<Table> => {
    const accessToken = tokenStorage.getAccessToken();
    if (!accessToken) {
      throw new ApiErrorClass('No access token available', 401);
    }

    const response = await fetch(`${API_BASE_URL}/business/${bizId}/services/${tableData.service_id}/tables`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tableData),
    });
    
    return handleResponse<Table>(response);
  },

  updateTable: async (bizId: string, tableId: string, tableUpdate: TableUpdate): Promise<Table> => {
    const accessToken = tokenStorage.getAccessToken();
    if (!accessToken) {
      throw new ApiErrorClass('No access token available', 401);
    }

    const response = await fetch(`${API_BASE_URL}/business/${bizId}/tables/${tableId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tableUpdate),
    });
    
    return handleResponse<Table>(response);
  },

  deleteTable: async (bizId: string, tableId: string): Promise<void> => {
    const accessToken = tokenStorage.getAccessToken();
    if (!accessToken) {
      throw new ApiErrorClass('No access token available', 401);
    }

    const response = await fetch(`${API_BASE_URL}/business/${bizId}/tables/${tableId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new ApiErrorClass(errorData.detail || 'Failed to delete table', response.status);
    }
  },
};

// Resource API functions
export const resourceApi = {
  getResources: async (bizId: string): Promise<Resource[]> => {
    const accessToken = tokenStorage.getAccessToken();
    if (!accessToken) {
      throw new ApiErrorClass('No access token available', 401);
    }

    const response = await fetch(`${API_BASE_URL}/business/${bizId}/resources`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    
    return handleResponse<Resource[]>(response);
  },

  getResource: async (bizId: string, resourceId: string): Promise<Resource> => {
    const accessToken = tokenStorage.getAccessToken();
    if (!accessToken) {
      throw new ApiErrorClass('No access token available', 401);
    }

    const response = await fetch(`${API_BASE_URL}/business/${bizId}/resources/${resourceId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    
    return handleResponse<Resource>(response);
  },

  createResource: async (bizId: string, resourceData: ResourceCreate): Promise<Resource> => {
    const accessToken = tokenStorage.getAccessToken();
    if (!accessToken) {
      throw new ApiErrorClass('No access token available', 401);
    }

    const response = await fetch(`${API_BASE_URL}/business/${bizId}/resources`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(resourceData),
    });
    
    return handleResponse<Resource>(response);
  },

  updateResource: async (bizId: string, resourceId: string, resourceUpdate: ResourceUpdate): Promise<Resource> => {
    const accessToken = tokenStorage.getAccessToken();
    if (!accessToken) {
      throw new ApiErrorClass('No access token available', 401);
    }

    const response = await fetch(`${API_BASE_URL}/business/${bizId}/resources/${resourceId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(resourceUpdate),
    });
    
    return handleResponse<Resource>(response);
  },

  deleteResource: async (bizId: string, resourceId: string): Promise<void> => {
    const accessToken = tokenStorage.getAccessToken();
    if (!accessToken) {
      throw new ApiErrorClass('No access token available', 401);
    }

    const response = await fetch(`${API_BASE_URL}/business/${bizId}/resources/${resourceId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new ApiErrorClass(errorData.detail || 'Failed to delete resource', response.status);
    }
  },
};

// ============================================================================
// PUBLIC API (No authentication required)
// ============================================================================

export const publicApi = {
  // Get business details by slug
  getBusinessDetails: async (slug: string): Promise<Business> => {
    const response = await fetch(`${API_BASE_URL}/public/businesses/${slug}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    return handleResponse<Business>(response);
  },

  // Get business services
  getBusinessServices: async (slug: string, activeOnly: boolean = true): Promise<ServiceWithOpenIntervals[]> => {
    const url = new URL(`${API_BASE_URL}/public/businesses/${slug}/services`);
    if (activeOnly) {
      url.searchParams.append('active_only', 'true');
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    return handleResponse<ServiceWithOpenIntervals[]>(response);
  },

  // Get service tables
  getServiceTables: async (slug: string, serviceId: string, activeOnly: boolean = true): Promise<Table[]> => {
    const url = new URL(`${API_BASE_URL}/public/businesses/${slug}/services/${serviceId}/tables`);
    if (activeOnly) {
      url.searchParams.append('active_only', 'true');
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    return handleResponse<Table[]>(response);
  },

  // Check availability for a service on a specific date
  checkAvailability: async (
    slug: string, 
    date: string, 
    partySize: number, 
    serviceId: string,
    tableId?: string,
    slotIncrementMinutes: number = 15
  ): Promise<AvailabilityMatrix> => {
    const url = new URL(`${API_BASE_URL}/public/businesses/${slug}/availability`);
    url.searchParams.append('date_', date);
    url.searchParams.append('party_size', partySize.toString());
    url.searchParams.append('service_id', serviceId);
    url.searchParams.append('slot_increment_minutes', slotIncrementMinutes.toString());
    
    if (tableId) {
      url.searchParams.append('table_id', tableId);
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    return handleResponse<AvailabilityMatrix>(response);
  },

  // Create a booking
  createBooking: async (slug: string, bookingData: BookingCreate): Promise<BookingWithService> => {
    const response = await fetch(`${API_BASE_URL}/public/businesses/${slug}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingData),
    });
    
    return handleResponse<BookingWithService>(response);
  },

  // Get booking details with phone number verification
  getBookingDetails: async (bookingId: string, phoneNumber: string): Promise<BookingWithService> => {
    const url = new URL(`${API_BASE_URL}/public/bookings/${bookingId}`);
    url.searchParams.append('phone_number', phoneNumber);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    return handleResponse<BookingWithService>(response);
  },

  // Get booking details by ID only (for email confirmation links)
  getBookingDetailsById: async (bookingId: string): Promise<BookingWithService> => {
    const response = await fetch(`${API_BASE_URL}/public/bookings/${bookingId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    return handleResponse<BookingWithService>(response);
  },

  // Cancel a booking with phone number verification
  cancelBooking: async (bookingId: string, phoneNumber: string): Promise<BookingWithService> => {
    const url = new URL(`${API_BASE_URL}/public/bookings/${bookingId}/cancel`);
    url.searchParams.append('phone_number', phoneNumber);

    const response = await fetch(url.toString(), {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    return handleResponse<BookingWithService>(response);
  },

  // Cancel a booking by ID only (for email confirmation links)
  cancelBookingById: async (bookingId: string): Promise<BookingWithService> => {
    const response = await fetch(`${API_BASE_URL}/public/bookings/${bookingId}/cancel`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    return handleResponse<BookingWithService>(response);
  },
}; 