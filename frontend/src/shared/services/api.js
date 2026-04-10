import axios from 'axios';

const LOCAL_HOST_PREFIXES = ['172.', '192.168.', '10.'];
const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS', 'TRACE'];
const RUNTIME_API_URL_PLACEHOLDER = '__VITE_API_URL__';
const MISSING_API_URL_MESSAGE =
  'VITE_API_URL is not configured. Set the Railway frontend variable VITE_API_URL to your backend public URL.';

const trimTrailingSlash = (value = '') => value.replace(/\/+$/, '');
const isLocalHost = (host = '') =>
  host === 'localhost' ||
  host === '127.0.0.1' ||
  LOCAL_HOST_PREFIXES.some((prefix) => host.startsWith(prefix));

const getApiUrl = () => {
  const envUrl = (import.meta.env?.VITE_API_URL || RUNTIME_API_URL_PLACEHOLDER).trim();
  if (envUrl && envUrl !== RUNTIME_API_URL_PLACEHOLDER) {
    return trimTrailingSlash(envUrl);
  }

  const host = window.location.hostname || '';
  if (isLocalHost(host)) {
    return `http://${host}:8000`;
  }

  return '';
};

export const API_BASE_URL = getApiUrl();
const HAS_API_BASE_URL = Boolean(API_BASE_URL);

if (!HAS_API_BASE_URL && typeof window !== 'undefined' && !isLocalHost(window.location.hostname || '')) {
  console.error(MISSING_API_URL_MESSAGE);
}

export const getApiRequestUrl = (path = '') => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  if (!HAS_API_BASE_URL) {
    throw new Error(MISSING_API_URL_MESSAGE);
  }

  return `${API_BASE_URL}${normalizedPath}`;
};

const api = axios.create({
  baseURL: API_BASE_URL || undefined,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  transformRequest: [
    (data, headers) => {
      if (data instanceof FormData) {
        return data;
      }

      if (headers['Content-Type'] === 'application/json') {
        return JSON.stringify(data);
      }

      return data;
    },
  ],
  withCredentials: true,
});

function getCookie(name) {
  let cookieValue = null;

  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i += 1) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === `${name}=`) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }

  return cookieValue;
}

api.interceptors.request.use(
  (config) => {
    if (!HAS_API_BASE_URL) {
      const error = new Error(MISSING_API_URL_MESSAGE);
      error.code = 'API_URL_MISSING';
      return Promise.reject(error);
    }

    const method = (config.method || '').toUpperCase();
    if (!SAFE_METHODS.includes(method)) {
      const csrfToken = getCookie('csrftoken');
      if (csrfToken) {
        config.headers['X-CSRFToken'] = csrfToken;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isAuthRequest =
      originalRequest?.url?.includes('/api/auth/') ||
      originalRequest?.url?.includes('/api/login/') ||
      originalRequest?.url?.includes('/api/password-reset/');

    if (error.response?.status === 401 && !originalRequest?._retry && !isAuthRequest) {
      originalRequest._retry = true;

      try {
        await api.post('/api/auth/token/refresh-cookie/');
        return api(originalRequest);
      } catch (refreshError) {
        if (window.location.pathname !== '/login') {
          window.location.href = '/login?expired=true';
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

const handleApiError = (error) => {
  if (error?.code === 'API_URL_MISSING') {
    return MISSING_API_URL_MESSAGE;
  }

  if (error.response) {
    const { status, data } = error.response;

    switch (status) {
      case 400:
        if (data.detail || data.error) {
          return data.detail || data.error;
        }
        if (typeof data === 'object' && Object.keys(data).length > 0) {
          return data;
        }
        return 'Неверные данные';
      case 401:
        return 'Необходима авторизация';
      case 403:
        return 'Доступ запрещен';
      case 404:
        return 'Ресурс не найден';
      case 429:
        return 'Слишком много запросов. Попробуйте позже';
      case 500:
        return 'Ошибка сервера. Попробуйте позже';
      default:
        if (typeof data === 'object' && Object.keys(data).length > 0) {
          return data;
        }
        return data.detail || data.error || `Ошибка ${status}`;
    }
  }

  if (error.request) {
    return 'Ошибка соединения. Проверьте интернет';
  }

  return error.message || 'Неизвестная ошибка';
};

export const authAPI = {
  login: (credentials) => api.post('/api/auth/login/', credentials),
  logout: () => api.post('/api/auth/logout/'),
  refreshToken: () => api.post('/api/auth/token/refresh-cookie/'),
  getProfile: () => api.get('/api/auth/profile/'),
  updateProfile: (data) => api.patch('/api/auth/profile/update/', data),
  updateProfileComplete: (data) => {
    const values = Object.values(data || {});
    const hasFile = values.some((value) => value instanceof File || value instanceof Blob);

    if (!hasFile) {
      return api.patch('/api/auth/profile/update-complete/', data, {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') {
        return;
      }

      if (value instanceof File || value instanceof Blob) {
        formData.append(key, value);
        return;
      }

      if (value instanceof Date) {
        formData.append(key, value.toISOString().slice(0, 10));
        return;
      }

      if (typeof value === 'object') {
        formData.append(key, JSON.stringify(value));
        return;
      }

      formData.append(key, value);
    });

    return api.patch('/api/auth/profile/update-complete/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  changePassword: (data) => api.post('/api/auth/change-password/', data),
  resetPassword: (email) => api.post('/api/auth/request-password-reset/', { email }),
  verifyReset: (data) => api.post('/api/auth/confirm-password-reset/', data),
  requestEmailVerify: () => api.post('/api/auth/email/verify/request/'),
  verifyEmail: (token) => api.post('/api/auth/verify-email/', { token }),
  listDevices: () => api.get('/api/auth/devices/'),
  revokeDevice: (deviceId) => api.post(`/api/auth/devices/${deviceId}/revoke/`),
  revokeAllDevices: () => api.post('/api/auth/devices/revoke-all/'),
  twofaSetup: (force = false) => api.post('/api/auth/2fa/setup/', { force }),
  twofaEnable: (code) => api.post('/api/auth/2fa/enable/', { code }),
  twofaDisable: () => api.post('/api/auth/2fa/disable/'),
};

export const profileAPI = {
  get: () => authAPI.getProfile(),
  update: (data) => authAPI.updateProfile(data),
  changePassword: (data) => authAPI.changePassword(data),
  requestEmailVerification: () => authAPI.requestEmailVerify(),
};

export const paymentAPI = {
  create: (paymentData) => api.post('/api/payments/create-payment/', paymentData),
};

export const adminAPI = {};

export const educationAPI = {
  uploadDocument: ({ file, name = 'IELTS Certificate', description = '' }) => {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('document_type', 'language_certificate');
    formData.append('file', file);
    if (description) {
      formData.append('description', description);
    }

    return api.post('/api/education/documents/upload/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  listDocuments: () => api.get('/api/education/documents/'),
  getDocumentSignedUrl: (id) => api.get(`/api/education/documents/${id}/signed-url/`),
  deleteDocument: (id) => api.delete(`/api/education/documents/${id}/`),
  getDashboardStats: () => api.get('/api/education/dashboard/stats/'),
  getDeadlines: () => api.get('/api/education/dashboard/deadlines/'),
  listEvents: () => api.get('/api/education/events/'),
  createEvent: (data) => api.post('/api/education/events/', data),
  deleteEvent: (id) => api.delete(`/api/education/events/${id}/`),
};

export const apiHelpers = {
  handleError: handleApiError,
  checkConnection: async () => {
    try {
      await api.get('/api/auth/profile/', { timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  },
  safeCall: async (apiCall, defaultValue = null) => {
    try {
      const response = await apiCall();
      return { success: true, data: response.data, error: null };
    } catch (error) {
      return { success: false, data: defaultValue, error: handleApiError(error) };
    }
  },
};

export default api;
