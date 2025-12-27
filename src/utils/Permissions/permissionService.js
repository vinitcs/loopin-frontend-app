import {Platform} from 'react-native';
import {
  check,
  request,
  checkNotifications,
  requestNotifications,
  PERMISSIONS,
  RESULTS,
} from 'react-native-permissions';

/**
 * 🔔 Notification Permission
 */
export const requestNotificationPermission = async () => {
  try {
    // Android < 13 → permission auto-granted
    if (Platform.OS === 'android' && Platform.Version < 33) {
      return true;
    }

    // iOS & Android 13+
    const {status} = await checkNotifications();
    if (status === RESULTS.GRANTED) {
      return true;
    }

    const requestResult = await requestNotifications([
      'alert',
      'sound',
      'badge',
    ]);

    return requestResult.status === RESULTS.GRANTED;
  } catch (error) {
    console.log('Notification permission error:', error);
    return false;
  }
};

/**
 * 📷 Camera Permission
 */
export const requestCameraPermission = async () => {
  try {
    const permission =
      Platform.OS === 'ios'
        ? PERMISSIONS.IOS.CAMERA
        : PERMISSIONS.ANDROID.CAMERA;

    const currentStatus = await check(permission);
    if (currentStatus === RESULTS.GRANTED) return true;

    const status = await request(permission);
    return status === RESULTS.GRANTED;
  } catch (error) {
    console.log('Camera permission error:', error);
    return false;
  }
};


/**
 * 🖼 Gallery / Media Permission
 */
export const requestGalleryPermission = async () => {
  try {
    let permission;

    if (Platform.OS === 'ios') {
      permission = PERMISSIONS.IOS.PHOTO_LIBRARY;
    } else if (Platform.Version >= 33) {
      permission = PERMISSIONS.ANDROID.READ_MEDIA_IMAGES;
    } else {
      permission = PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE;
    }

    const currentStatus = await check(permission);
    if (currentStatus === RESULTS.GRANTED) return true;

    const status = await request(permission);
    return status === RESULTS.GRANTED;
  } catch (error) {
    console.log('Gallery permission error:', error);
    return false;
  }
};

