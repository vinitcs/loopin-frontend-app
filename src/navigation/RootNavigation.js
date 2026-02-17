import api from '../api/apiInstance';
import {useEffect, useState} from 'react';
import EncryptedStorage from 'react-native-encrypted-storage';
import {useDispatch, useSelector} from 'react-redux';
import SplashScreen from '../screens/SplashScreen';
import {login, setUserRoles, logout} from '../redux/slices/authSlice';
import {NavigationContainer} from '@react-navigation/native';
import AppStack from './AppStack';
import AuthStack from './AuthStack';
import {colors} from '.././theme/colors/colors';

const RootNavigation = () => {
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  const {isAuthenticated} = useSelector(state => state.auth);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      console.log('Checking authentication....');
      const token = await EncryptedStorage.getItem('accessToken');

      // console.log('stored access token:::', token);

      if (!token) {
        dispatch(logout());
        return;
      }

      let res;
      try {
        res = await api.post('/api/v1/auth/verify/access-token');
      } catch (error) {
        if (error.response?.status === 401) {
          // Wait a moment in case interceptor refreshed token
          const newAccessToken = await EncryptedStorage.getItem('accessToken');
          if (newAccessToken) {
            console.log('Retrying verify after token refresh...');
            res = await api.post('/api/v1/auth/verify/access-token');
          } else {
            throw error;
          }
        } else {
          throw error;
        }
      }

      // console.log('Verify Access Token res data:::', res.data);

      if (res.data?.success) {
        const {userRoles} = res.data;
        dispatch(login());
        dispatch(setUserRoles(userRoles));
      } else {
        dispatch(logout());
      }
    } catch (error) {
      console.log('Auth check failed:', error.message);
      dispatch(logout());
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading ? (
        <SplashScreen />
      ) : (
        <NavigationContainer>
          {isAuthenticated ? <AppStack /> : <AuthStack />}
        </NavigationContainer>
      )}
    </>
  );
};

export default RootNavigation;
