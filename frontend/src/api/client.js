const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiClient {
  constructor() {
    this.baseUrl = BASE_URL;
  }

  getHeaders(customHeaders = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...customHeaders,
    };
    const token = localStorage.getItem('edutrack_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const config = {
      ...options,
      headers: this.getHeaders(options.headers),
    };

    if (options.body && typeof options.body === 'object') {
      config.body = JSON.stringify(options.body);
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('edutrack_token');
          localStorage.removeItem('edutrack_user');
          if (window.location.pathname.startsWith('/app')) {
            window.location.href = '/login?expired=true';
          }
        }
        throw new Error(data.message || `Request failed with status ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`API Error [${options.method || 'GET'} ${endpoint}]:`, error);
      throw error;
    }
  }

  get(endpoint, params = {}) {
    const queryString = new URLSearchParams(
      Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== '')
    ).toString();
    const fullEndpoint = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(fullEndpoint, { method: 'GET' });
  }

  post(endpoint, body = {}) {
    return this.request(endpoint, { method: 'POST', body });
  }

  put(endpoint, body = {}) {
    return this.request(endpoint, { method: 'PUT', body });
  }

  patch(endpoint, body = {}) {
    return this.request(endpoint, { method: 'PATCH', body });
  }

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

export const api = new ApiClient();
export default api;
