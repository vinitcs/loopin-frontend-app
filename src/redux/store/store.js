import {configureStore} from '@reduxjs/toolkit';
import userReducer from '../slices/userSlice';
import postReducer from '../slices/postSlice';
import authReducer from '../slices/authSlice';
import contentReducer from '../slices/contentSlice';
import geoDataReducer from '../slices/geoDataSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    post: postReducer,
    content: contentReducer,
    geoData: geoDataReducer,
  },
});

export default store;
