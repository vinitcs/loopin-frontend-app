import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  verifiedUserPhone: '',
  verifiedUserEmail: '',
  selectedUser: '',
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setVerifiedUserPhone: (state, action) => {
      state.verifiedUserPhone = action.payload;
    },
    setVerifiedUserEmail: (state, action) => {
      state.verifiedUserEmail = action.payload;
    },
    setSelectedUser: (state, action) => {
      state.verifiedUserEmail = action.payload;
    },
  },
});

export const {setVerifiedUserPhone, setVerifiedUserEmail, setSelectedUser} =
  userSlice.actions;

export default userSlice.reducer;
