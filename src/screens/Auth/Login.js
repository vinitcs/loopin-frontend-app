import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import React, {useState} from 'react';
import {colors} from '../../theme/colors/colors';
import {fonts} from '../../theme/fonts/fonts';
import Button from '../../components/Button/Button';
import UserInput from '../../components/Credentials/UserInput';
import {useNavigation} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';
import api from '../../api/apiInstance';
import EncryptedStorage from 'react-native-encrypted-storage';
import {useDispatch} from 'react-redux';
import {login} from '../../redux/slices/authSlice';
import Toast from 'react-native-toast-message';
import { getFCMToken } from '../../utils/FCM/fcmService';

const {height: screenHeight} = Dimensions.get('window');

const Login = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    phone: '',
    password: '',
  });

  const [isLogging, setIsLogging] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData({...formData, [field]: value});
  };

  const handleLogin = async () => {
    // console.log('login data...', formData);
    setIsLogging(true);
    try {
      // console.log('###### working login #########');
      if (!formData.phone) {
        Toast.show({
          type: 'error',
          text1: 'Enter phone number',
        });
        return;
      }

      if (!formData.password) {
        Toast.show({
          type: 'error',
          text1: 'Enter Password',
        });
        return;
      }

      const deviceToken = await getFCMToken();

      const payload = {
        phone: formData.phone,
        password: formData.password,
        deviceToken,
        deviceType: Platform.OS,
        longitude: '0',
        latitude: '0',
      };

      const response = await api.post('/api/v1/user/login', payload);

      // console.log('login res:::', response.data);

      if (response.data?.success) {
        const {accessToken, refreshToken} = response.data;

        await EncryptedStorage.setItem('accessToken', accessToken);
        await EncryptedStorage.setItem('refreshToken', refreshToken);

        dispatch(login());

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
      const status = error?.response?.status;

      const commonClientErrors = [400, 401, 403, 404];

      if (commonClientErrors.includes(status)) {
        return Toast.show({
          type: 'error',
          text1: error.response?.data?.message || 'Invalid credentials',
        });
      }

      if (status >= 500) {
        return Toast.show({
          type: 'error',
          text1: 'Server error. Please try again.',
        });
      }

      return Toast.show({
        type: 'error',
        text1: error.message || 'Something went wrong. Please try again.',
      });
    } finally {
      setIsLogging(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <View style={styles.contentWrapper}>
          <View style={styles.mainSection}>
            <Text style={styles.loginTitle}>LOG IN</Text>

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
              type="phone"
              placeholder={'Enter phone'}
              focus={true}
              onChangeState={text => handleInputChange('phone', text)}
            />
            <UserInput
              placeholder={'Enter password'}
              leftIcon={true}
              leftIconName={'lock-closed-outline'}
              rightIcon={true}
              isPassword={true}
              onChangeState={text => handleInputChange('password', text)}
            />
            <Button
              Title={isLogging ? 'Logging...' : 'Log In'}
              BackgroundColor={'Primary'}
              TextColor={'Text3'}
              onPressChanges={handleLogin}
            />

            <View style={styles.forgetPassSection}>
              <TouchableOpacity
                onPress={() => navigation.navigate('ForgotPassword')}>
                <Text style={styles.forgetPassText}>Forgot Password ?</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.footerSection}>
            <Text style={styles.footerText}>Already haven't an account?</Text>
            <TouchableOpacity>
              <Text
                style={styles.navigateText}
                onPress={() => navigation.navigate('UserRegister')}>
                Sign up here
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Login;

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

  loginTitle: {
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
    fontSize: 12,
    textAlign: 'center',
    fontFamily: fonts.SemiBold,
    letterSpacing: 0.2,
    bottom: 4,
  },

  forgetPassSection: {
    // backgroundColor:'orange',
    flexDirection: 'row-reverse',
    // marginTop: 12,
  },
  forgetPassText: {
    color: colors.lightText,
    fontFamily: fonts.Medium,
    fontSize: 12,
    // letterSpacing: 0.2,
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
