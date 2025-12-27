// import {PermissionsAndroid, Platform} from 'react-native';

// export const requestNotificationPermission = async () => {
//   if ((Platform.OS === 'android') & (Platform.Version >= 33)) {
//     const result = await PermissionsAndroid.request(
//       PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
//     );

//     return result === PermissionsAndroid.RESULTS.GRANTED;
//   }
//   return true;
// };

// export const requestMediaPermission = async () => {
//   if (Platform.OS === 'android') {
//     if (Platform.Version >= 33) {
//       const result = await PermissionsAndroid.requestMultiple([
//         PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
//         PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
//       ]);

//       return (
//         result['android.permission.READ_MEDIA_IMAGES'] ===
//           PermissionsAndroid.RESULTS.GRANTED &&
//         result['android.permission.READ_MEDIA_VIDEO'] ===
//           PermissionsAndroid.RESULTS.GRANTED
//       );
//     }
//     const result = await PermissionsAndroid.request(
//       PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
//     );
//     return result === PermissionsAndroid.RESULTS.GRANTED;
//   }
//   return true;
// };
