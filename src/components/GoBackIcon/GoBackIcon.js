import {StyleSheet, View, TouchableOpacity} from 'react-native';
import React from 'react';
// import { Icon } from '@rneui/themed';
import {useNavigation} from '@react-navigation/native';
import {MoveLeft} from 'lucide-react-native';

const GoBackIcon = ({color}) => {
  const navigation = useNavigation();
  return (
    <View style={styles.goBackIcon}>
      <TouchableOpacity>
        {/* <Icon
          name="arrow-back-outline"
          type="ionicon"
          size={28}
          onPress={() => {
            navigation.goBack();
          }}
          color={color}
        /> */}
        <MoveLeft
          size={26}
          onPress={() => {
            navigation.goBack();
          }}
          color={color}
        />
      </TouchableOpacity>
    </View>
  );
};

export default GoBackIcon;

const styles = StyleSheet.create({
  goBackIcon: {
//     backgroundColor:"pink",
    justifyContent: 'center',
    alignItems: 'center',
//     marginTop: 15,
  },
});
