import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import Header from '../components/Custom/Header';

const NotificationScreen = () => {
  return (
    <View>
      <Header showAppLogo={false}/>
      <Text>NotificationScreen</Text>
    </View>
  );
};

export default NotificationScreen;

const styles = StyleSheet.create({});
