import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import React, {useState} from 'react';
import {colors} from '../../theme/colors/colors';
import {fonts} from '../../theme/fonts/fonts';
import Button from '../../components/Button/Button';
import UserInput from '../../components/Credentials/UserInput';
import {useNavigation} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';
import auth from '@react-native-firebase/auth';
import Toast from 'react-native-toast-message';

const {height: screenHeight} = Dimensions.get('window');

const Register = () => {
  const navigation = useNavigation();

  // const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: '',
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({...prev, [field]: value}));
  };

  // console.log('register data...', formData);

  // const validateForm = () => {
  //   let newErrors = {};
  //   if (!form.name.trim()) newErrors.name = 'Name is required';
  //   if (!form.phone.trim() || !/^\d{10}$/.test(form.phone))
  //     newErrors.phone = 'Valid 10-digit phone number is required';
  //   if (!form.password.trim() || form.password.length < 6)
  //     newErrors.password = 'Password must be at least 6 characters';
  //   setErrors(newErrors);
  //   return Object.keys(newErrors).length === 0;
  // };

  const handleRegister = async () => {
    try {
      if (!formData.phone) {
        Toast.show({
          type: 'info',
          text1: 'Enter phone number',
        });
        return;
      }

      const confirmation = await auth().signInWithPhoneNumber(formData.phone);

      navigation.navigate('OtpVerification', {});

      navigation.navigate('OtpVerification', {
        confirmationResult: confirmation,
        formData,
        phone: formData.phone,
        buttonTitle: 'Sign Up',
        navigator: 'Tabs',
        nextScreen: 'Home',
        type: 'signUp',
        // onVerify: async otp => {
        //   // Here you can call your OTP verification API
        //   console.log('Verifying OTP:', otp);
        // },
      });
    } catch (error) {
      // console.error('Error sending OTP:', error);

      Toast.show({
        type: 'error',
        text1: error.message || 'Unknown error',
      });
    }

    // console.log('Registered Data: ', formData);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{flex: 1}}> */}
      <ScrollView
        contentContainerStyle={styles.scrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <View style={styles.contentWrapper}>
          <View style={styles.mainSection}>
            <Text style={styles.signupTitle}>SIGN UP</Text>

            <View style={styles.welcomeContent}>
              <Text style={styles.welcomeHeaderText}>Welcome To,</Text>
              <Image
                style={styles.logo}
                source={require('../../assets/dummylogo.png')}
              />
              <Text style={styles.subText}>
                Stay in the Loop — Post. Connect. Share.
              </Text>
            </View>

            <UserInput
              placeholder={'Enter name'}
              leftIcon={true}
              leftIconName={'person-outline'}
              value={formData.name}
              onChangeState={val => handleInputChange('name', val)}
            />

            <UserInput
              type="phone"
              placeholder={'Enter phone'}
              value={formData.phone}
              onChangeState={val => handleInputChange('phone', val)}
            />

            <UserInput
              placeholder={'Enter password'}
              leftIcon={true}
              leftIconName={'lock-closed-outline'}
              rightIcon={true}
              isPassword={true}
              value={formData.password}
              onChangeState={val => handleInputChange('password', val)}
            />

            <Button
              Title={'Verify OTP'}
              BackgroundColor={'Primary'}
              TextColor={'Text3'}
              onPressChanges={handleRegister}
            />
          </View>

          <View style={styles.footerSection}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <TouchableOpacity>
              <Text
                style={styles.navigateText}
                onPress={() => navigation.navigate('UserLogin')}>
                Login here
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      {/* </KeyboardAvoidingView> */}
    </SafeAreaView>
  );
};

export default Register;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.Background1,
    paddingHorizontal: 15,
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
    gap: 18,
    paddingVertical: 40,
    // flex: 1,
    // justifyContent: 'center',
  },

  signupTitle: {
    // backgroundColor:'orange',
    fontFamily: fonts.SemiBold,
    fontSize: 22,
    color: colors.lightText,
    textAlign: 'center',
    marginBottom: 10,
  },
  welcomeContent: {
    flexDirection: 'column',
    gap: 10,
    marginBottom: 10,
  },
  welcomeHeaderText: {
    color: colors.Text1,
    fontSize: 12,
    textAlign: 'center',
  },
  logo: {
    resizeMode: 'contain',
    width: '100%',
    height: 30,
    alignItems: 'center',
  },
  subText: {
    fontSize: 10,
    textAlign: 'center',
    fontFamily: fonts.SemiBold,
  },

  footerSection: {
    // backgroundColor: 'orange',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  footerText: {
    fontFamily: fonts.lightText,
    fontSize: 12,
  },
  navigateText: {
    fontFamily: fonts.SemiBold,
    fontSize: 12,
    color: colors.Highlight2,
  },
});
