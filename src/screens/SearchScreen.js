import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {colors} from '../theme/colors/colors';
import {fonts} from '../theme/fonts/fonts';

const SearchScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Search feature will be introduced soon.</Text>
    </View>
  );
};

export default SearchScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    gap: 10,
  },
  title: {
    fontSize: 14,
    fontFamily: fonts.Medium,
    color: colors.Text2,
    marginBottom: 15,
    textAlign: 'center',
  },
});
