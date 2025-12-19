import React, {useEffect} from 'react';
import {View, Text, Image, StyleSheet} from 'react-native';
import {colors} from '../theme/colors/colors';
import {fonts} from '../theme/fonts/fonts';

const SplashScreen = () => {
  useEffect(() => {
    // Delay to simulate splash effect then navigate to AppStack
    const timeout = setTimeout(() => {}, 3000); // 3 seconds

    return () => clearTimeout(timeout);
  }, []);

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/dummylogo.png')} // your logo here
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.title}>Loopin</Text>
      <Text style={styles.subtitle}>
         Stay in the Loop — Post. Connect. Share.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.Background1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    height: 120,
    width: 120,
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontFamily: fonts.SemiBold,
    color: colors.Text1,
    textAlign: 'center',
},
subtitle: {
    fontSize: 14,
    fontFamily: fonts.Medium,
    color: colors.Text2,
    marginTop: 10,
    textAlign: 'center',
  },
});

export default SplashScreen;
