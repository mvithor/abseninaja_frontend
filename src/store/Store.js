import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import CustomizerReducer from './customizer/CustomizerSlice';
import sidebarReducer from './apps/sidebar/sidebarSlice';
import userReducer from './apps/user/userSlice';
import PendaftaranSekolah from './apps/pendaftaran-sekolah/pendaftaranSekolahSlice.jsx'



const rootReducer = combineReducers({
  user: userReducer,
  customizer: CustomizerReducer,
  sidebar: sidebarReducer,
  pendaftaran: PendaftaranSekolah,
});

// Konfigurasi persistensi
const persistConfig = {
  key: 'root',
  storage,
  blacklist: ['someReducerToExclude'],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);