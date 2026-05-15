import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  // NOTE: Do NOT set a default Content-Type here.
  // - For JSON requests, axios auto-sets 'application/json' when the body is an object.
  // - For FormData requests, axios auto-sets 'multipart/form-data; boundary=...'
  // Setting a default Content-Type breaks FormData uploads because the
  // multipart boundary is missing, causing multer to fail on the backend.
});

// Request interceptor — attach JWT and handle Content-Type
api.interceptors.request.use(
  (config) => {
    // Attach auth token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // If the data is FormData, let the browser set the Content-Type
    // (with the correct multipart boundary). Delete any explicit header.
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle auth errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Only redirect if not already on login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
