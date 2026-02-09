import React, {useEffect} from 'react';
import {StyleSheet, View, Text} from 'react-native';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import SplashScreen from 'react-native-splash-screen';
import {Provider} from 'react-redux';
import store from './src/redux/store/store';
import RootNavigation from './src/navigation/RootNavigation';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import Toast, {BaseToast, ErrorToast} from 'react-native-toast-message';
import {colors} from './src/theme/colors/colors';
import {fonts} from './src/theme/fonts/fonts';
import messaging from '@react-native-firebase/messaging';
import {requestNotificationPermission} from './src/utils/Permissions/permissionService';
import {getFCMToken, listenTokenRefresh} from './src/utils/FCM/fcmService';
import {registerForegroundHandlers} from './src/utils/FCM/notificationHandler';

const toastConfig = {
  success: props => (
    <BaseToast
      {...props}
      style={{
        borderLeftWidth: 0,
        // borderLeftColor: colors.Primary
      }}
      // contentContainerStyle={{paddingHorizontal: 15}}
      text1Style={{
        fontSize: 14,
        fontFamily: fonts.Regular,
        flexWrap: 'wrap',
      }}
      text1NumberOfLines={0}
    />
  ),
  error: props => (
    <ErrorToast
      {...props}
      style={{
        borderLeftWidth: 0,
      }}
      text1Style={{
        fontSize: 14,
        flexWrap: 'wrap',
      }}
      text2Style={{
        fontSize: 12,
        flexWrap: 'wrap',
      }}
      text1NumberOfLines={0}
      text2NumberOfLines={0}
    />
  ),

  tomatoToast: ({text1, text2}) => (
    <View
      style={{height: 60, width: '100%', backgroundColor: colors.Highlight3}}>
      <Text>{text1}</Text>
      <Text>{text2}</Text>
    </View>
  ),
};

const App = () => {
  // const isDarkMode = useColorScheme() === 'dark';
  useEffect(() => {
    SplashScreen.hide();

    const initFCM = async () => {
      await requestNotificationPermission();
      await messaging().registerDeviceForRemoteMessages();
      const token = await getFCMToken();

      console.log('FCM Token:', token);
    };

    initFCM();
    const unsubscribeTokenRefresh = listenTokenRefresh();

    return () => {
      unsubscribeTokenRefresh?.();
    };
  }, []);

  useEffect(() => {
    const unsubscribe = registerForegroundHandlers();
    return unsubscribe;
  }, []);

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <SafeAreaProvider>
        <Provider store={store}>
          <SafeAreaWrapper>
            {/* <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} /> */}
            <RootNavigation />
            <Toast config={toastConfig} />
          </SafeAreaWrapper>
        </Provider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

const SafeAreaWrapper = ({children}) => {
  // const insets = useSafeAreaInsets(); // use when custom padding is to need pass if custom header/footer/sidebar, For now go with SafeAreaView
  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        //  {paddingTop: insets.top}
      ]}>
      <View style={styles.container}>{children}</View>
    </SafeAreaView>
  );
};

export default App;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
  },
});
