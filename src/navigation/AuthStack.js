import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Login from '../screens/Auth/Login';
import Register from '../screens/Auth/Register';
import OtpVerification from '../screens/Auth/OtpVerification';
import ForgotPassword from '../screens/Auth/ForgotPassword';
import NewPassword from '../screens/Auth/NewPassword';

const Stack = createNativeStackNavigator();

const AuthStack = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="UserLogin" component={Login} />

      <Stack.Screen name="UserRegister" component={Register} />

      <Stack.Screen name="OtpVerification" component={OtpVerification} />

      <Stack.Screen name="ForgotPassword" component={ForgotPassword} />

      <Stack.Screen name="NewPassword" component={NewPassword} />
    </Stack.Navigator>
  );
};

export default AuthStack;

const styles = StyleSheet.create({});
