import {StyleSheet, View, Text, Dimensions, ScrollView} from 'react-native';
import React, {useState} from 'react';
import {colors} from '../../theme/colors/colors';
import {fonts} from '../../theme/fonts/fonts';
import Button from '../../components/Button/Button';
import UserInput from '../../components/Credentials/UserInput';
import {useNavigation} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Header from '../../components/Custom/Header';
import auth from '@react-native-firebase/auth';
import Toast from 'react-native-toast-message';

const {height: screenHeight} = Dimensions.get('window');

const ForgotPassword = () => {
  const [phone, setPhone] = useState('');
  const navigation = useNavigation();

  const handleSubmit = async () => {
    try {
      if (!phone) {
        Toast.show({
          type: 'info',
          text1: 'Enter phone number',
        });
        return;
      }
      const confirmation = await auth().signInWithPhoneNumber(phone);

      navigation.navigate('OtpVerification', {
        confirmationResult: confirmation,
        phone: phone,
        buttonTitle: 'Reset Password',
        navigator: 'NewPassword',
        nextScreen: 'NewPassword',
        type: 'resetPassword',
        // onVerify: async otp => {
        //   // Here you can call your OTP verification API
        //   console.log('Verifying OTP:', otp);
        // },
      });
    } catch (error) {
      // console.error('Error sending OTP:', error);
      Toast.show({
        type: 'error',
        text1: error.message,
      });
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
            <Text style={styles.title}>Forgot Password</Text>
            <Text style={styles.titleDescription}>
              Enter the phone associated with your account and we'll send an SMS
              with OTP code to reset your password.
            </Text>

            <UserInput
              type="phone"
              placeholder={'Enter Phone'}
              useState={phone}
              onChangeState={phone => setPhone(phone)}
            />

            <Button
              Title={'Verify OTP'}
              BackgroundColor={'Primary'}
              TextColor={'Text3'}
              onPressChanges={handleSubmit}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ForgotPassword;

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
    gap: 14,
  },

  title: {
    textAlign: 'center',
    fontFamily: fonts.SemiBold,
    fontSize: 18,
    color: colors.lightText,
  },
  titleDescription: {
    fontFamily: fonts.Regular,
    fontSize: 12,
    letterSpacing: 0.2,
    color: colors.lightText,
  },
});
