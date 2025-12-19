import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  allCities: [],
};

const geoDataSlice = createSlice({
  name: 'geoData',
  initialState,
  reducers: {
    setAllCities: (state, action) => {
      state.allCities = action.payload;
    },
  },
});

export const {setAllCities} = geoDataSlice.actions;
export default geoDataSlice.reducer;
