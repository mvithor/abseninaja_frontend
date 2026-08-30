import { createSlice } from '@reduxjs/toolkit';
import { REHYDRATE } from 'redux-persist';
import {jwtDecode} from 'jwt-decode';

const safeDecodeTimezone = (accessToken) => {
  if (!accessToken) return 'Asia/Jakarta';
  try {
    const decoded = jwtDecode(accessToken);
    return decoded.timezone_sekolah || 'Asia/Jakarta';
  } catch {
    return 'Asia/Jakarta';
  }
};

const initialState = {
  name: '',
  role: '',
  email:'',
  userId: null,
  accessToken: null,
  isLoggedIn: false,
  deviceId: null,
  isKepalaJurusan: false,
  timezone_sekolah: 'Asia/Jakarta',
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser(state, action) {
      const { name, role, email, userId, accessToken, deviceId, isKepalaJurusan } = action.payload;
      try {
        const decodedToken = jwtDecode(accessToken);
        const currentTime = Math.floor(Date.now() / 1000);

        if (decodedToken.exp < currentTime) {
          return;
        }

        state.name = name;
        state.role = role;
        state.email = email || decodedToken.email;
        state.userId = userId;
        state.accessToken = accessToken;
        state.deviceId = deviceId;
        state.isLoggedIn = true;
        state.isKepalaJurusan = Boolean(isKepalaJurusan ?? decodedToken.isKepalaJurusan);
        state.timezone_sekolah = decodedToken.timezone_sekolah || 'Asia/Jakarta';
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
      state.timezone_sekolah = 'Asia/Jakarta';
    },
  },
  extraReducers: (builder) => {
    // Saat redux-persist rehydrate state lama (sebelum ada field timezone_sekolah),
    // decode langsung dari accessToken yang tersimpan.
    builder.addCase(REHYDRATE, (state, action) => {
      const persistedUser = action.payload?.user;
      if (!persistedUser) return;
      if (!persistedUser.timezone_sekolah && persistedUser.accessToken) {
        state.timezone_sekolah = safeDecodeTimezone(persistedUser.accessToken);
      }
    });
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
