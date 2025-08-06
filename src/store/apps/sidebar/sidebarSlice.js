import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isOpen: false,
  activeItem: null,
};

const sidebarSlice = createSlice({
  name: 'sidebar',
  initialState,
  reducers: {
    toggleSidebar(state) {
      state.isOpen = !state.isOpen;
    },
    setActiveItem(state, action) {
      state.activeItem = action.payload;
    },
  },
});

export const { toggleSidebar, setActiveItem } = sidebarSlice.actions;
export default sidebarSlice.reducer;