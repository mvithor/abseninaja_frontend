import axios from 'axios';
import { store } from '../store/Store';
import { clearUser } from '../store/apps/user/userSlice';
import isTokenExpired from './isTokenExpired';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 60000,
  withCredentials: true,
});

const PUBLIC_AUTH_ENDPOINTS = ['/api/v1/login'];
const isPublicAuthRequest = (url) => PUBLIC_AUTH_ENDPOINTS.some((path) => url?.includes(path));

// Logout butuh token, tapi 401-nya tidak boleh memicu pengalihan sendiri:
// useLogout sudah membersihkan sesi lokal dan berpindah ke /login.
const isLogoutRequest = (url) => url?.includes('/api/v1/logout');

// Satu jalur untuk mengeluarkan pengguna ketika sesi tidak berlaku lagi.
// Penanda isForcingLogout mencegah banyak request paralel yang gagal bersamaan
// memicu pengalihan berkali-kali, dan tidak dialihkan bila sudah di halaman login.
let isForcingLogout = false;
const forceLogout = () => {
  store.dispatch(clearUser());
  if (isForcingLogout || window.location.pathname === '/login') return;
  isForcingLogout = true;
  window.location.href = '/login?expired=true';
};

axiosInstance.interceptors.request.use(
  (config) => {
    if (isPublicAuthRequest(config.url)) {
      return config;
    }

    const token = store.getState().user.accessToken;

    if (token) {
      // Token kedaluwarsa atau tidak terbaca: jangan dikirim ke server
      if (isTokenExpired(token)) {
        forceLogout();
        return Promise.reject(new Error('Token expired'));
      }

      config.headers['Authorization'] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    console.error('Request Error:', error.message);
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const isPublicAuthCall = isPublicAuthRequest(error.config?.url);

    // 401 dari server berarti sesi tidak berlaku (token tidak valid, kedaluwarsa, atau dicabut).
    // 503 (Redis bermasalah) dan 403 (tidak punya izin) sengaja TIDAK mengeluarkan pengguna.
    if (error.response?.status === 401 && !isPublicAuthCall && !isLogoutRequest(error.config?.url)) {
      forceLogout();
    }

    console.error('Response Error:', error.message);
    return Promise.reject(error);
  }
);

export default axiosInstance;