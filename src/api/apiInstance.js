import axios from 'axios';
import {BACKEND_SERVER_URL} from '@env';
import EncryptedStorage from 'react-native-encrypted-storage';

const api = axios.create({
  baseURL: BACKEND_SERVER_URL,
  timeout: 60000, // 60 seconds
  // headers: {
  //   'Content-Type': 'application/json',
  // },
});

// Add token automatically to every request
api.interceptors.request.use(async config => {
  try {
    const accessToken = await EncryptedStorage.getItem('accessToken');

    config.headers = {
      ...config.headers, // preserve multipart/form-data
    };

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  } catch (error) {
    // console.error('Error fetching access token:', error);
    return config;
  }
});

// Handle global response errors
// Automatically refresh token on 401 (unauthorized)
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    // If 401 (unauthorized) and not already retried, _retry flag prevents looping.
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await EncryptedStorage.getItem('refreshToken');
        if (!refreshToken) {
          console.warn('No refresh token found. Logging out...');
          throw new Error('No refresh token available');
        }

        // Refresh token API call
        const refreshResponse = await axios.post(
          `${BACKEND_SERVER_URL}/api/v1/user/refresh-token`,
          {refreshToken},
        );

        if (refreshResponse.data?.success) {
          const newAccessToken = refreshResponse.data.accessToken;

          // Save new access token securely
          await EncryptedStorage.setItem('accessToken', newAccessToken);

          // Update header and retry original request
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          console.log('🔄 Access token refreshed successfully');

          return api(originalRequest);
        } else {
          console.warn('Refresh token API failed. Logging out...');
          await EncryptedStorage.clear();
        }
      } catch (refreshError) {
        // console.error('Token refresh failed:', refreshError.message);
        await EncryptedStorage.clear();
      }
    }

    return Promise.reject(error);
  },
);

export default api;
