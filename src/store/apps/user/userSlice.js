import { createSlice } from '@reduxjs/toolkit';
import {jwtDecode} from 'jwt-decode';

const initialState = {
  name: '',
  role: '',
  email:'',
  userId: null,
  accessToken: null,
  isLoggedIn: false,
  deviceId: null, 
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser(state, action) {
      
      const { name, role, email,  userId, accessToken, deviceId } = action.payload;
      console.log("Payload dari backend:", action.payload);
      try {
        // Validasi token sebelum menyimpannya
        const decodedToken = jwtDecode(accessToken);
        console.log("Decoded Token di Frontend:", decodedToken); 
        const currentTime = Math.floor(Date.now() / 1000);

        if (decodedToken.exp < currentTime) {
          console.warn('Access token telah kedaluwarsa. Tidak dapat menyimpan ke state.');
          return;
        }

        state.name = name;
        state.role = role;
        state.email = email || decodedToken.email
        state.userId = userId;
        state.accessToken = accessToken;
        state.deviceId = deviceId;
        state.isLoggedIn = true;

        console.log('User state berhasil diperbarui:', { name, role, email, userId, deviceId });
      } catch (error) {
        console.error('Error saat decode atau validasi token:', error.message);
      }
    },
    clearUser(state) {
      console.warn('User state di-reset. Semua data pengguna dihapus.');
      state.name = '';
      state.role = '';
      state.email = '';
      state.userId = null;
      state.accessToken = null;
      state.isLoggedIn = false;
      state.deviceId = null;
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;