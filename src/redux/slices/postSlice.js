import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  allPosts: [],
};

const postSlice = createSlice({
  name: 'post',
  initialState,
  reducers: {
    setAllPosts: (state, action) => {
      state.allPosts = action.payload;
    },
  },
});

export const {setAllPosts} = postSlice.actions;
export default postSlice.reducer;
