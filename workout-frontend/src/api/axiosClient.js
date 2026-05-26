import axios from 'axios';
import keycloak from '../auth/keycloak';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8080',
});

// request interceptor — attach JWT
apiClient.interceptors.request.use(config => {
  if (keycloak.token) {
    config.headers.Authorization = `Bearer ${keycloak.token}`;
  }
  return config;
});

// response interceptor — handle 401 (token expired race condition)
apiClient.interceptors.response.use(
  res => res,
  async err => {
    if (err.response?.status === 401) {
      await keycloak.updateToken(5);   // force refresh
      err.config.headers.Authorization = `Bearer ${keycloak.token}`;
      return apiClient.request(err.config);  // retry once
    }
    return Promise.reject(err);
  }
);

export default apiClient;