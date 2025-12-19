import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  ScrollView,
  Alert,
} from 'react-native';
import React, {useState} from 'react';
import {colors} from '../../theme/colors/colors';
import {fonts} from '../../theme/fonts/fonts';
import Button from '../../components/Button/Button';
import UserInput from '../../components/Credentials/UserInput';
import {useNavigation, useRoute} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Header from '../../components/Custom/Header';
import api from '../../api/apiInstance';

const {height: screenHeight} = Dimensions.get('window');

const NewPassword = () => {
  const [password, setPassword] = useState('');
  const navigation = useNavigation();
  const route = useRoute();
  const {phone, idToken} = route.params || {};

  const handleUpdatePassword = async () => {
    try {
      if (!password) {
        Alert.alert('Enter new password');
        return;
      }

      const payload = {
        phone,
        newPassword: password,
        idToken,
      };

      // console.log('new password payload:::', payload);

      const response = await api.patch('/api/v1/user/update/password', payload);

      if (response.data?.success) {
        navigation.navigate('UserLogin');
        Alert.alert('Success', response.data.message);
      } else {
        Alert.alert('Error', 'Error while updating user password');
        navigation.navigate('UserLogin');
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        Alert.alert(
          'User not found',
          error.response.data.message || 'User not found. Try again!',
        );
        navigation.navigate('UserLogin');
      } else {
        Alert.alert(
          'Error',
          'Error while updating user password: ' +
            (error.response?.data?.message || error.message),
        );
      }
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
            <Text style={styles.title}>Create new password</Text>
            {/* <Text style={styles.subText}>
          Your new password must be different from previous used passwords.
        </Text> */}

            <UserInput
              placeholder={'Enter new password'}
              leftIcon={true}
              leftIconName={'lock-closed-outline'}
              rightIcon={true}
              isPassword={true}
              // useState={password}
              onChangeState={text => setPassword(text)}
            />

            <Button
              Title={'Reset Password'}
              BackgroundColor={'Primary'}
              TextColor={'Text3'}
              onPressChanges={handleUpdatePassword}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default NewPassword;

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
    // backgroundColor:'orange',
    paddingHorizontal: 15,
    gap: 14,
  },

  title: {
    fontFamily: fonts.SemiBold,
    fontSize: 18,
    color: colors.lightText,
    textAlign: 'center',
  },

  subText: {
    fontFamily: fonts.Regular,
    fontSize: 12,
    color: colors.lightText,
    textAlign: 'center',
  },
});
