import {StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import React from 'react';
import {colors} from '../../theme/colors/colors';
import {fonts} from '../../theme/fonts/fonts';

const Button = ({
  Title,
  BackgroundColor,
  TextColor,
  onPressChanges,
  disabled = false,
}) => {
  return (
    <TouchableOpacity
      style={{
        width: '100%',
        backgroundColor: colors[BackgroundColor],
        opacity: disabled ? 0.5 : 1,
        borderRadius: 12,
        paddingVertical: 10,
      }}
      activeOpacity={0.7}
      disabled={disabled}
      onPress={!disabled ? onPressChanges : null}>
      <Text
        style={{
          // backgroundColor:'pink',
          fontFamily: fonts.Medium,
          fontSize: 17.5,
          color: colors[TextColor],
          textAlign: 'center',
        }}>
        {Title}
      </Text>
    </TouchableOpacity>
  );
};

export default Button;

const styles = StyleSheet.create({});
