import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  allContent: [],
  allLoggedUserContent: [],
};

const contentSlice = createSlice({
  name: 'content',
  initialState,
  reducers: {
    setAllContent: (state, action) => {
      state.allContent = action.payload;
    },
    setAllLoggedUserContent: (state, action) => {
      state.allLoggedUserContent = action.payload;
    },
  },
});

export const {setAllContent, setAllLoggedUserContent} = contentSlice.actions;
export default contentSlice.reducer;
