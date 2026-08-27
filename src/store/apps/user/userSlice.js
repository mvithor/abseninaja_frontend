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
  isKepalaJurusan: false,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser(state, action) {
      
      const { name, role, email,  userId, accessToken, deviceId, isKepalaJurusan } = action.payload;
      try {
        // Validasi token sebelum menyimpannya
        const decodedToken = jwtDecode(accessToken);
        const currentTime = Math.floor(Date.now() / 1000);

        if (decodedToken.exp < currentTime) {
          return;
        }

        state.name = name;
        state.role = role;
        state.email = email || decodedToken.email
        state.userId = userId;
        state.accessToken = accessToken;
        state.deviceId = deviceId;
        state.isLoggedIn = true;
        state.isKepalaJurusan = Boolean(isKepalaJurusan ?? decodedToken.isKepalaJurusan);
      } catch (error) {
        console.error('Error saat decode atau validasi token:', error.message);
      }
    },
    clearUser(state) {
      state.name = '';
      state.role = '';
      state.email = '';
      state.userId = null;
      state.accessToken = null;
      state.isLoggedIn = false;
      state.deviceId = null;
      state.isKepalaJurusan = false;
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;