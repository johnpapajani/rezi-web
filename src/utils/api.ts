import { AuthResponse, SignUpData, SignInData, ApiError, LogoutResponse, Business, BusinessUpdate, BusinessWithRole, BusinessCreate, Booking, BookingWithService, BookingUpdate, BookingFilters, BookingStatusUpdate, BookingReschedule, DailyBookingSummary, BookingAnalytics } from '../types';

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
      errorMessage = errorData.detail || errorMessage;
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

  createBusiness: async (businessData: BusinessCreate): Promise<Business> => {
    const accessToken = tokenStorage.getAccessToken();
    if (!accessToken) {
      throw new ApiErrorClass('No access token available', 401);
    }

    const response = await fetch(`${API_BASE_URL}/business/`, {
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