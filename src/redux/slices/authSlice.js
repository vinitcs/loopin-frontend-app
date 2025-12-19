import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  isAuthenticated: false,
  userRoles: [],
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login(state) {
      state.isAuthenticated = true;
    },
    setUserRoles(state, action) {
      state.userRoles = action.payload;
    },
    logout(state) {
      state.isAuthenticated = false;
      state.userRoles = [];
    },
  },
});

export const {login, setUserRoles, logout} = authSlice.actions;
export default authSlice.reducer;
