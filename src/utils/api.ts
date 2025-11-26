// API Configuration and Helper Functions
const API_BASE_URL = 'http://https://eventbackend-ten.vercel.app/api';

// Get auth token from localStorage
const getAuthToken = () => {
  const user = localStorage.getItem('eventManager');
  if (user) {
    const userData = JSON.parse(user);
    return userData.token;
  }
  return null;
};

// API request helper
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(error.message || 'API request failed');
  }

  return response.json();
};

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  loginWithPhone: async (phone: string, otp: string) => {
    return apiRequest('/auth/phone-login', {
      method: 'POST',
      body: JSON.stringify({ phone, otp }),
    });
  },


  register: async (name: string, email: string, phone: string, password: string, address: string, lat?: number, lng?: number) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, phone, password, address, lat, lng }),
    });
  },

  verifyAadhar: async (aadharNumber: string) => {
    return apiRequest('/auth/verify-aadhar', {
      method: 'POST',
      body: JSON.stringify({ aadharNumber }),
    });
  },

  changePassword: async (currentPassword: string, password: string) => {
    return apiRequest('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, password }),
    });
  },

  getMe: async () => {
    return apiRequest('/auth/me');
  },
};

// Services API
export const servicesAPI = {
  getAll: async (page = 1, limit = 10, category?: string) => {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (category) params.append('category', category);
    return apiRequest(`/services?${params}`);
  },

  create: async (serviceData: FormData) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/services`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: serviceData,
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(error.message || 'Failed to create service');
    }
    
    return response.json();
  },

  update: async (id: string, serviceData: FormData) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/services/${id}`, {
      method: 'PUT',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: serviceData,
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(error.message || 'Failed to update service');
    }
    
    return response.json();
  },

  delete: async (id: string) => {
    return apiRequest(`/services/${id}`, { method: 'DELETE' });
  },

  getCategories: async () => {
    return apiRequest('/services/categories/list');
  },
};

// Bookings API
export const bookingsAPI = {
  getAll: async (page = 1, limit = 10, status?: string) => {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (status) params.append('status', status);
    return apiRequest(`/bookings?${params}`);
  },

  getById: async (id: string) => {
    return apiRequest(`/bookings/${id}`);
  },

  create: async (bookingData: any) => {
    return apiRequest('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  },

  updateStatus: async (id: string, status: string) => {
    return apiRequest(`/bookings/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  getStats: async () => {
    return apiRequest('/bookings/stats/dashboard');
  },

  getAnalytics: async () => {
    return apiRequest('/bookings/analytics/dashboard');
  },

  getCompleted: async (limit = 10) => {
    return apiRequest(`/bookings/completed/recent?limit=${limit}`);
  },
};

// Broadcast Requests API
export const broadcastAPI = {
  getAll: async (page = 1, limit = 10, status = 'Open') => {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString(), status });
    return apiRequest(`/broadcasts?${params}`);
  },

  getById: async (id: string) => {
    return apiRequest(`/broadcasts/${id}`);
  },

  accept: async (id: string) => {
    return apiRequest(`/broadcasts/${id}/accept`, { method: 'PUT' });
  },

  getAccepted: async (page = 1, limit = 10) => {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    return apiRequest(`/broadcasts/my/accepted?${params}`);
  },

  getStats: async () => {
    return apiRequest('/broadcasts/stats/dashboard');
  },
};

// Availability API
export const availabilityAPI = {
  getAll: async (month?: number, year?: number) => {
    const params = new URLSearchParams();
    if (month) params.append('month', month.toString());
    if (year) params.append('year', year.toString());
    return apiRequest(`/availability?${params}`);
  },

  getByDate: async (date: string) => {
    return apiRequest(`/availability/${date}`);
  },

  set: async (availabilityData: any) => {
    return apiRequest('/availability', {
      method: 'POST',
      body: JSON.stringify(availabilityData),
    });
  },

  update: async (id: string, availabilityData: any) => {
    return apiRequest(`/availability/${id}`, {
      method: 'PUT',
      body: JSON.stringify(availabilityData),
    });
  },

  delete: async (id: string) => {
    return apiRequest(`/availability/${id}`, { method: 'DELETE' });
  },

  getCalendar: async (month: number, year: number) => {
    return apiRequest(`/availability/calendar/${month}/${year}`);
  },

  checkAvailability: async (managerId: string, date: string, time?: string) => {
    return apiRequest('/availability/check', {
      method: 'POST',
      body: JSON.stringify({ managerId, date, time }),
    });
  },
};

// Reviews API
export const reviewsAPI = {
  getAll: async (page = 1, limit = 10, rating?: number) => {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (rating) params.append('rating', rating.toString());
    return apiRequest(`/reviews?${params}`);
  },

  create: async (reviewData: any) => {
    return apiRequest('/reviews', {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  },

  getStats: async () => {
    return apiRequest('/reviews/stats/dashboard');
  },
};

// Users API
export const usersAPI = {
  getProfile: async () => {
    return apiRequest('/users/profile');
  },

  updateProfile: async (profileData: any) => {
    return apiRequest('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },

  uploadPhoto: async (photoData: FormData) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/users/upload-photo`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: photoData,
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(error.message || 'Failed to upload photo');
    }
    
    return response.json();
  },
};