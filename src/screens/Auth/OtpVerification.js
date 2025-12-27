import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  ScrollView,
  Platform,
} from 'react-native';
import React, {useState} from 'react';
import {colors} from '../../theme/colors/colors';
import {fonts} from '../../theme/fonts/fonts';
import Button from '../../components/Button/Button';
import UserInput from '../../components/Credentials/UserInput';
import {useNavigation, useRoute} from '@react-navigation/native';
import GoBackIcon from '../../components/GoBackIcon/GoBackIcon';
import {SafeAreaView} from 'react-native-safe-area-context';
import api from '../../api/apiInstance';
import EncryptedStorage from 'react-native-encrypted-storage';
import {useDispatch} from 'react-redux';
import {login, setUserRoles} from '../../redux/slices/authSlice';
// import auth from '@react-native-firebase/auth';
import Header from '../../components/Custom/Header';
import Toast from 'react-native-toast-message';
import {getFCMToken} from '../../utils/FCM/fcmService';

const {height: screenHeight} = Dimensions.get('window');

const OtpVerification = () => {
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();

  const {
    confirmationResult,
    formData,
    phone,
    buttonTitle,
    navigator,
    nextScreen,
    type,
  } = route.params || {};

  const handleVerify = async () => {
    if (!otp.trim()) {
      Toast.show({
        type: 'info',
        text1: 'Please enter the OTP',
      });
      return;
    }

    try {
      if (!confirmationResult) {
        Toast.show({
          type: 'info',
          text1: 'Confirmation session expired. Please resend OTP',
        });
        return;
      }

      setIsVerifying(true);

      const userCredential = await confirmationResult.confirm(otp);
      const idToken = await userCredential.user.getIdToken(true);

      switch (type) {
        case 'signUp':
          try {
            const {name, phone, password} = formData;

            const deviceToken = await getFCMToken();

            const payload = {
              name,
              phone,
              password,
              deviceToken,
              deviceType: Platform.OS,
              idToken,
              longitude: '0',
              latitude: '0',
            };

            const response = await api.post('/api/v1/user/signup', payload);

            if (response.data?.success) {
              const {accessToken, refreshToken, userRoles} = response.data;

              await EncryptedStorage.setItem('accessToken', accessToken);
              await EncryptedStorage.setItem('refreshToken', refreshToken);

              dispatch(login());
              dispatch(setUserRoles(userRoles));

              Toast.show({
                type: 'success',
                text1: response.data.message,
              });
            } else {
              Toast.show({
                type: 'error',
                text1: response.data.message || 'Unknown error',
              });
            }
          } catch (error) {
            if (error.response && error.response.status === 409) {
              Toast.show({
                type: 'info',
                text1: error?.response?.data?.message || 'Unknown error',
              });
              navigation.navigate('UserLogin');
            } else {
              Toast.show({
                type: 'error',
                text1: error?.response?.data?.message || 'Unknown error',
              });
            }
          }
          break;

        case 'resetPassword':
          try {
            if (idToken) {
              navigation.navigate(nextScreen, {phone, idToken});
            } else {
              Toast.show({
                type: 'error',
                text1: 'Error while updating user password',
              });
              navigation.navigate('UserLogin');
            }
          } catch (error) {
            if (error.response && error.response.status === 404) {
              Toast.show({
                type: 'error',
                text1:
                  error?.response?.data?.message ||
                  'User not found. Try again!',
              });

              navigation.navigate('UserLogin');
            } else {
              Toast.show({
                type: 'error',
                text1: error?.response?.data?.message || error.message,
              });
            }
          }

        // Other types will get added later like resetPassword
        default:
          break;
      }
    } catch (error) {
      if (error.code === 'auth/invalid-verification-code') {
        Toast.show({
          type: 'error',
          text1: 'Invalid OTP, Please check and try again.',
        });
      } else if (error.code === 'auth/session-expired') {
        Toast.show({
          type: 'error',
          text1: 'Session expired, Please resend the OTP.',
        });
      } else {
        console.log('OTP verification failed:', error);
        Toast.show({
          type: 'error',
          text1: error.message || 'Something went wrong.',
        });
      }
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header showAppLogo={false} />

      <ScrollView
        contentContainerStyle={styles.scrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <View style={styles.contentWrapper}>
          <View style={styles.mainSection}>
            <View style={styles.title}>
              <Text style={styles.subText}>OTP has sent to</Text>
              <Text style={styles.sendToText}>{phone}</Text>
            </View>

            <UserInput
              placeholder={'Enter OTP'}
              leftIcon={true}
              leftIconName={'shield-outline'}
              value={otp}
              onChangeState={text => setOtp(text)}
            />

            <View style={styles.resendSection}>
              <Text style={styles.resendMessage}>
                Did not receive the SMS? or
              </Text>
              <Text style={styles.resendText}>try again</Text>
            </View>
            <Button
              Title={isVerifying ? 'Verifying...' : buttonTitle}
              BackgroundColor={'Primary'}
              TextColor={'Text3'}
              onPressChanges={handleVerify}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default OtpVerification;

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.Background1,
    flex: 1,
  },

  scrollView: {
    flexGrow: 1,
    // justifyContent: 'center',
  },
  contentWrapper: {
    minHeight: screenHeight - 100,
    justifyContent: 'center',
  },

  mainSection: {
    // backgroundColor: 'orange',
    paddingHorizontal: 15,
    gap: 4,
  },

  title: {
    // backgroundColor:'orange',
    height: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    alignItems: 'center',
    bottom: 10,
  },

  subText: {
    fontFamily: fonts.Semibold,
    fontSize: 14,
    color: colors.lightText,
  },

  sendToText: {
    fontFamily: fonts.Bold,
    fontSize: 16,
    color: colors.lightText,
  },

  resendSection: {
    paddingVertical: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },

  resendMessage: {
    fontFamily: fonts.lightText,
    fontSize: 12,
  },
  resendText: {
    fontFamily: fonts.SemiBold,
    fontSize: 12,
    color: colors.Highlight2,
  },
});
