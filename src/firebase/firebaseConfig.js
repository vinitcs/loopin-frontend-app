// Method 3
import {firebase} from '@react-native-firebase/app';
import '@react-native-firebase/auth'; // ensure Auth module is registered

// ✅ No manual config or initializeApp() needed
// The native Firebase SDK reads google-services.json automatically.

export default firebase;

// Method 2
// import {initializeApp, getApps, getApp} from '@react-native-firebase/app';
// import '@react-native-firebase/auth'; // import this to register the Auth module

// // If you’re using environment variables:
// import {
//   FIREBASE_API_KEY,
//   FIREBASE_AUTH_DOMAIN,
//   FIREBASE_PROJECT_ID,
//   FIREBASE_STORAGE_BUCKET,
//   FIREBASE_MESSAGING_SENDER_ID,
//   FIREBASE_APP_ID,
// } from '@env';

// // ✅ Your Firebase configuration
// const firebaseConfig = {
//   apiKey: FIREBASE_API_KEY,
//   authDomain: FIREBASE_AUTH_DOMAIN,
//   projectId: FIREBASE_PROJECT_ID,
//   storageBucket: FIREBASE_STORAGE_BUCKET,
//   messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
//   appId: FIREBASE_APP_ID,
// };

// // ✅ Initialize only once
// const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// export default app;

// Method 1
// import {initializeApp} from '@react-native-firebase/app';
// import auth from '@react-native-firebase/auth';
// import {
//   FIREBASE_API_KEY,
//   FIREBASE_AUTH_DOMAIN,
//   FIREBASE_PROJECT_ID,
//   FIREBASE_STORAGE_BUCKET,
//   FIREBASE_MESSAGING_SENDER_ID,
//   FIREBASE_APP_ID,
// } from '@env';

// const firebaseConfig = {
//   apiKey: FIREBASE_API_KEY,
//   authDomain: FIREBASE_AUTH_DOMAIN,
//   projectId: FIREBASE_PROJECT_ID,
//   storageBucket: FIREBASE_STORAGE_BUCKET,
//   messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
//   appId: FIREBASE_APP_ID,
// };

// // Initialize only if not already initialized
// try {
//   initializeApp(firebaseConfig);
// } catch (err) {
//   console.log('Firebase already initialized or auto-initialized');
// }

// export {auth};
