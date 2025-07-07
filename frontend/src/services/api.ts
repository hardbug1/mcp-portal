import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios';
import { errorHandler } from '../utils/errorHandler';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000, // 30초 타임아웃
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        const appError = errorHandler.handleError(error, 'API Request');
        return Promise.reject(appError);
      }
    );

    // Response interceptor to handle token refresh and errors
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        // 토큰 갱신 처리
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
              const response = await axios.post(`${this.api.defaults.baseURL}/auth/refresh`, {
                refreshToken,
              });
              
              const { accessToken } = response.data;
              localStorage.setItem('accessToken', accessToken);
              
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
              return this.api(originalRequest);
            }
          } catch (refreshError) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            window.location.href = '/login';
            return Promise.reject(errorHandler.handleError(refreshError, 'Token Refresh'));
          }
        }
        
        // 에러 핸들링
        const appError = errorHandler.handleError(error, 'API Response');
        return Promise.reject(appError);
      }
    );
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.put<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.delete<T>(url, config);
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService; 