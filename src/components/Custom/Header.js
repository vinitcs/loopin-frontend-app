import {StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import React from 'react';
import {Bell, EllipsisVertical} from 'lucide-react-native';
import {useNavigation} from '@react-navigation/native';
import GoBackIcon from '../GoBackIcon/GoBackIcon';
import {fonts} from '../../theme/fonts/fonts';
import {colors} from '../../theme/colors/colors';

const Header = ({
  showAppLogo = true,
  showBell = false,
  showEllipsisVertical = false,
  showTitle = false,
  titleContent = '',
  bottomSheetRef,
}) => {
  const navigation = useNavigation();

  const navigateTo = () => {
    navigation.navigate('Notification');
  };

  const openSettingSheet = () => {
    bottomSheetRef.current?.openSheet('settings', ['50%']);
  };
  return (
    <View style={styles.container}>
      {/* Left section */}
      <View style={styles.leftSection}>
        {showAppLogo ? (
          <Text
            style={{
              fontSize: 18,
              fontFamily: fonts.Bold,
              color: colors.Primary,
            }}>
            LoopIn
          </Text>
        ) : (
          <GoBackIcon />
        )}
      </View>

      {/* Center section */}
      <View style={styles.centerSection}>
        {showTitle && <Text style={styles.title}>{titleContent}</Text>}
      </View>

      {/* Right section */}
      <View style={styles.rightSection}>
        <View style={styles.sectionGroup}>
          <View style={styles.sectionPair}>
            {showBell && (
              <TouchableOpacity
                style={styles.actionFeatureIcon}
                onPress={navigateTo}>
                <Bell color={colors.Primary} fill={colors.Primary} size={20} />
              </TouchableOpacity>
            )}

            {showEllipsisVertical && (
              <TouchableOpacity onPress={openSettingSheet}>
                <EllipsisVertical
                  color={colors.Primary}
                  fill={colors.Primary}
                  size={20}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  container: {
    // backgroundColor: colors.Highlight1,
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  leftSection: {
    // backgroundColor: colors.Accent, // testing 
    width: 60,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  centerSection: {
    // backgroundColor: colors.Outline, // testing
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightSection: {
    // backgroundColor: colors.Error, // testing
    width: 60,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  sectionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionPair: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionFeatureIcon: {
    padding: 4,
  },
  title: {
    fontSize: 14,
    fontFamily: fonts.SemiBold,
    color: colors.Text1,
    textAlign: 'center',
  },
});
