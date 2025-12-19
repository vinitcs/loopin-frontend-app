import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {colors} from '../../theme/colors/colors';

export const CopyrightFooter = ({style}) => {
  const currentYear = new Date().getFullYear();

  return (
    <View style={[styles.copyrightContainer, style]}>
      <Text style={styles.copyrightText}>
        © {currentYear} Loopin. All rights reserved.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  copyrightContainer: {
    padding: 16,
    backgroundColor: colors.Background1,
    borderTopWidth: 1,
    borderTopColor: colors.Outline,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copyrightText: {
    fontSize: 12,
    color: colors.Text2,
    textAlign: 'center',
  },
});
