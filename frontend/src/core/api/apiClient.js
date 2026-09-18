const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Cliente HTTP unificado con interceptores de solicitud y respuesta.
 * - Inyecta automáticamente el token JWT Bearer si existe en localStorage o sessionStorage.
 * - Procesa errores de red, respuestas HTTP no exitosas (4xx, 5xx) y formatos ProblemDetails.
 * - Centraliza el manejo de sesión caducada (401).
 */
class ApiClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  getAuthToken() {
    return localStorage.getItem('tempus_token') || sessionStorage.getItem('tempus_token') || null;
  }

  async request(endpoint, options = {}) {
    const url = endpoint.startsWith('http')
      ? endpoint
      : `${this.baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Request Interceptor: Inyección automática de token de autenticación
    const token = this.getAuthToken();
    if (token && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);

      if (response.status === 204) {
        return null;
      }

      const contentType = response.headers.get('content-type') || '';
      const isJson = contentType.includes('application/json');
      const data = isJson ? await response.json().catch(() => null) : null;

      // Response Interceptor: Detección y normalización de errores globales
      if (!response.ok) {
        const errorMsg =
          data?.detail ||
          data?.message ||
          data?.title ||
          (typeof data === 'string' ? data : `Error HTTP ${response.status}`);

        const error = new Error(errorMsg);
        error.status = response.status;
        error.code = data?.code || null;
        error.data = data;

        // Si la sesión expiró (401), se limpia la persistencia local
        if (response.status === 401) {
          localStorage.removeItem('tempus_token');
          sessionStorage.removeItem('tempus_token');
        }

        throw error;
      }

      return data;
    } catch (err) {
      if (err instanceof TypeError && err.message.includes('Failed to fetch')) {
        throw new Error('No se pudo conectar con el servidor backend. Verifica que la API esté en ejecución en el puerto 5000.');
      }
      throw err;
    }
  }

  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  post(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  put(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient;
