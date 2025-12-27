import messaging from '@react-native-firebase/messaging';
import EncryptedStorage from 'react-native-encrypted-storage';

export const getFCMToken = async () => {
  try {
    const storedToken = await EncryptedStorage.getItem('fcmToken');
    if (storedToken) return storedToken;

    const token = await messaging().getToken();
    if (token) {
      await EncryptedStorage.setItem('fcmToken', token);
      return token;
    }
    return null;
  } catch (error) {
    console.log('FCM token error:', error);
    return null;
  }
};

export const listenTokenRefresh = () => {
  return messaging().onTokenRefresh(async token => {
    console.log('FCM token refreshed:', token);
    await EncryptedStorage.setItem('fcmToken', token);
    // Optional: send updated token to backend
  });
};
