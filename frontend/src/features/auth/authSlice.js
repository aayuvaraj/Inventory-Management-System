import { createSlice } from '@reduxjs/toolkit';

const loadUser = () => {
  try {
    return JSON.parse(localStorage.getItem('ims_user') || 'null');
  } catch {
    return null;
  }
};

const initialState = {
  token: localStorage.getItem('ims_token'),
  user: loadUser(),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      localStorage.setItem('ims_token', action.payload.token);
      localStorage.setItem('ims_user', JSON.stringify(action.payload.user));
    },
    clearCredentials: (state) => {
      state.token = null;
      state.user = null;
      localStorage.removeItem('ims_token');
      localStorage.removeItem('ims_user');
    },
  },
});

export const { setCredentials, clearCredentials } = authSlice.actions;
export default authSlice.reducer;
