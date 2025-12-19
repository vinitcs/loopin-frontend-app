import {StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import React from 'react';
import {colors} from '../../theme/colors/colors';
import {Bell} from 'lucide-react-native';
import {useNavigation} from '@react-navigation/native';
import GoBackIcon from '../GoBackIcon/GoBackIcon';
import {fonts} from '../../theme/fonts/fonts';

const Header = ({showAppLogo = true, showBell = false}) => {
  const navigation = useNavigation();

  const navigateTo = () => {
    navigation.navigate('Notification');
  };
  return (
    <View style={styles.container}>
      {/* Left side logo */}
      {showAppLogo ? (
        <Text
          style={{
            fontSize: 18,
            fontFamily: fonts.Bold,
            color: colors.Primary,
          }}>
          Loopin
        </Text>
      ) : (
        <GoBackIcon />
      )}

      {/* Right side group */}
      <View style={styles.sectionGroup}>
        <View style={styles.sectionPair}>
          {showBell && (
            <TouchableOpacity
              style={styles.actionFeatureIcon}
              onPress={navigateTo}>
              <Bell color={colors.Primary} fill={colors.Primary} size={20} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.Background1,
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
  },
  sectionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionPair: {
    flexDirection: 'row',
    alignItems: 'center',
    //     marginRight: 14,
  },
  actionFeatureIcon: {
    padding: 4,
  },
});
