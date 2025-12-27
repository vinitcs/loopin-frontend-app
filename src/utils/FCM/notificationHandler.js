import messaging from '@react-native-firebase/messaging';

// 🔥 MUST be outside React components
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Background message:', remoteMessage);
});

// Foreground + opened handlers
export const registerForegroundHandlers = () => {
  const unsubscribeOnMessage = messaging().onMessage(async remoteMessage => {
    console.log('Foreground message:', remoteMessage);
  });

  const unsubscribeOnOpen = messaging().onNotificationOpenedApp(
    remoteMessage => {
      console.log('Opened from background:', remoteMessage);
    },
  );

  messaging()
    .getInitialNotification()
    .then(remoteMessage => {
      if (remoteMessage) {
        console.log('Opened from quit:', remoteMessage);
      }
    });

  return () => {
    unsubscribeOnMessage();
    unsubscribeOnOpen();
  };
};
