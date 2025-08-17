import axios from 'axios';
import { store } from '../store/Store';
import { setUser, clearUser } from '../store/apps/user/userSlice';
import {jwtDecode} from 'jwt-decode';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 60000,
  withCredentials: true,
});

console.log(import.meta.env.VITE_API_URL)

axiosInstance.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const token = state.user.accessToken;

    if (token) {
      try {
        const decodedToken = jwtDecode(token); 
        const currentTime = Math.floor(Date.now() / 1000);

        // Periksa apakah token sudah kadaluarsa
        if (decodedToken.exp < currentTime) {
          store.dispatch(clearUser());
          window.location.href = '/';
          return Promise.reject(new Error('Token expired'));
        }

        config.headers['Authorization'] = `Bearer ${token}`;
        config.headers['x-user-id'] = decodedToken.userId; 
      } catch (error) {
        console.error('Token decoding error:', error?.message || error);
        store.dispatch(clearUser());
        window.location.href = '/';
        return Promise.reject(error);
      }
    }

    return config;
  },
  (error) => {
    console.error('Request Error:', error.message);
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    const newToken = response.headers['x-access-token'];
    if (newToken) {
      try {
        const decodedToken = jwtDecode(newToken);
        store.dispatch(
          setUser({
            name: decodedToken.name, 
            role: decodedToken.role,
            userId: decodedToken.userId,
            accessToken: newToken,
          })
        );
      } catch (error) {
        console.error('Error saat memproses token baru:', error.message);
      }
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      store.dispatch(clearUser());
      window.location.href = '/';
    }

    console.error('Response Error:', error.message);
    return Promise.reject(error);
  }
);

export default axiosInstance;


