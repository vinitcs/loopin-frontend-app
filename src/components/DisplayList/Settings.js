import {StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import React from 'react';
import {colors} from '../../theme/colors/colors';
import Toast from 'react-native-toast-message';
import EncryptedStorage from 'react-native-encrypted-storage';
import {fonts} from '../../theme/fonts/fonts';
import api from '../../api/apiInstance';
import {useDispatch} from 'react-redux';
import {logout} from '../../redux/slices/authSlice';
import {UserPen, AtSign, ShieldCheck, ReceiptText} from 'lucide-react-native';
import {useNavigation} from '@react-navigation/native';

const Settings = ({bottomSheetRef}) => {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const handleLogout = async () => {
    try {
      const res = await api.post('/api/v1/user/logout');
      bottomSheetRef.current?.close();

      if (res.data?.success) {
        await EncryptedStorage.removeItem('AccessToken');
        await EncryptedStorage.removeItem('RefreshToken');

        dispatch(logout());
        Toast.show({
          type: 'success',
          text1: res.data.message,
        });
      } else {
        Toast.show({
          type: 'error',
          text1: res.data.message || 'Unknown error',
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error?.response?.data?.message || 'Error during logout',
      });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <View style={styles.listOptionSection}>
        <TouchableOpacity
          style={styles.actionProfileEditBtn}
          onPress={() => {
            navigation.navigate('EditProfile');
            bottomSheetRef.current?.close();
          }}>
          <UserPen color={colors.Primary} size={18} />
          <Text style={styles.actionProfileEditBtnLabel}>Edit profile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionProfileEditBtn}
          onPress={() => {
            navigation.navigate('EditNametag');
            bottomSheetRef.current?.close();
          }}>
          <AtSign color={colors.Primary} size={18} />
          <Text style={styles.actionProfileEditBtnLabel}>Edit nametag</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionProfileEditBtn}>
          <ShieldCheck color={colors.Primary} size={18} />
          <Text style={styles.actionProfileEditBtnLabel}>Privacy policy</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionProfileEditBtn}>
          <ReceiptText color={colors.Primary} size={18} />
          <Text style={styles.actionProfileEditBtnLabel}>
            Terms and conditions
          </Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutBtnLabel}>Log out</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Settings;

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
  listOptionSection: {
    gap: 8,
    paddingBottom: 20,
  },

  actionProfileEditBtn: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
  },

  actionProfileEditBtnLabel: {
    fontFamily: fonts.Medium,
    fontSize: 14,
    color: colors.Text2,
  },

  logoutBtn: {
    backgroundColor: colors.Primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: 'center',
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 12,
  },

  logoutBtnLabel: {
    fontFamily: fonts.SemiBold,
    fontSize: 14,
    color: colors.Text3,
  },
});
