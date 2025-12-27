import DateTimePicker from '@react-native-community/datetimepicker';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import React, {useCallback, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
} from 'react-native';
import EncryptedStorage from 'react-native-encrypted-storage';
import Toast from 'react-native-toast-message';
import api from '../api/apiInstance';
import Button from '../components/Button/Button';
import Header from '../components/Custom/Header';
import {colors} from '../theme/colors/colors';
import {fonts} from '../theme/fonts/fonts';

const EditProfileScreen = () => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchUserProfile();
    setRefreshing(false);
  }, []);

  const [form, setForm] = useState({
    name: '',
    email: '',
    bio: '',
    dob: '',
    // city: '',
    // state: '',
  });

  const [phone, setPhone] = useState('');

  const handleInputChange = (field, value) => {
    setForm({...form, [field]: value});
  };

  console.log(form);

  const fetchUserProfile = async () => {
    try {
      const res = await api.get('/api/v1/user/profile');

      if (res.data.success) {
        const user = {
          name: res.data.name,
          bio: res.data.bio,
          email: res.data.email,
          dob: res.data.dob,
          // city: res.data.city,
          // state: res.data.state,
        };
        setForm(user);
        setPhone(res.data.dialCode + res.data.phone);
      }
    } catch (error) {
      const status = error?.response?.status;
      const commonClientErrors = [400, 403, 404];

      if (status >= 500) {
        return Toast.show({
          type: 'error',
          text1: 'Server error. Please try again.',
        });
      }

      if (status === 401) {
        Toast.show({
          type: 'info',
          text1: 'Token expired. Logging out...',
        });
        await EncryptedStorage.removeItem('accessToken');
      }

      if (commonClientErrors.includes(status)) {
        Toast.show({
          type: 'error',
          text1:
            error?.response?.data?.message ||
            'Error while fetching user profile',
        });
      }
    }
  };

  const handleSaveChanges = async () => {
    try {
      setUploading(true);

      const res = await api.patch('/api/v1/user/profile/update', {...form});

      if (res.data.success) {
        Toast.show({
          type: 'success',
          text1: res.data.message,
        });
      }
    } catch (error) {
      const status = error?.response?.status;
      const commonClientErrors = [400, 403, 404];

      if (status >= 500) {
        return Toast.show({
          type: 'error',
          text1: 'Server error. Please try again.',
        });
      }

      if (status === 401) {
        Toast.show({
          type: 'info',
          text1: 'Token expired. Logging out...',
        });
        await EncryptedStorage.removeItem('accessToken');
      }

      if (commonClientErrors.includes(status)) {
        Toast.show({
          type: 'error',
          text1:
            error?.response?.data?.message ||
            'Error while updating user profile',
        });
      }
    } finally {
      setUploading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchUserProfile();
    }, []),
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{flex: 1}}>
      <ScrollView
        contentContainerStyle={{flexGrow: 1}}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        <Header showAppLogo={false} />
        <View style={styles.container}>
          {/* Name Field */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter name"
              value={form.name}
              onChangeText={text => handleInputChange('name', text)}
              textContentType="name"
              autoCompleteType="name"
              autoCorrect={false}
              editable={!uploading}
            />
          </View>

          {/* Bio Field */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Bio</Text>
            <TextInput
              style={styles.textArea}
              value={form.bio}
              multiline
              numberOfLines={6}
              placeholder="Enter bio"
              onChangeText={text => handleInputChange('bio', text)}
              textContentType="name"
              autoCompleteType="name"
              autoCorrect={false}
              editable={!uploading}
            />
          </View>

          {/* Email Field (Read-only) */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter email"
              value={form.email}
              onChangeText={text => handleInputChange('email', text)}
              textContentType="emailAddress"
              autoCompleteType="email"
              editable={!uploading}
            />
          </View>

          {/* Date of Birth Field */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Date of Birth</Text>
            <TouchableOpacity
              style={styles.input}
              onPress={() => {
                if (!uploading) {
                  setShowDatePicker(true);
                }
              }}>
              <Text
                style={{
                  color: form.dob ? colors.Text1 : colors.Text2,
                  fontSize: 12,
                }}>
                {form.dob
                  ? new Date(form.dob).toLocaleDateString('en-GB')
                  : 'Select date'}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={form.dob ? new Date(form.dob) : new Date()}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) {
                    handleInputChange('dob', selectedDate.toISOString());
                  }
                }}
              />
            )}
          </View>

          {/* Phone Field */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Phone</Text>
            <TextInput
              style={[styles.input, {backgroundColor: colors.Background3}]}
              editable={false}
              value={phone}
            />
            <Text style={styles.helperText}>Phone cannot be changed</Text>
          </View>

          {/* City Field */}
          {/* <View style={styles.fieldContainer}>
            <Text style={styles.label}>City</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter city"
              value={form.city}
              onChangeText={text => handleInputChange('city', text)}
              textContentType="addressCity"
              autoCompleteType="off"
              autoCorrect={false}
              editable={!uploading}
            />
          </View> */}

          {/* State Field */}
          {/* <View style={styles.fieldContainer}>
            <Text style={styles.label}>State</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter state"
              value={form.state}
              onChangeText={text => handleInputChange('state', text)}
              textContentType="addressState"
              autoCompleteType="off"
              autoCorrect={false}
              editable={!uploading}
            />
          </View> */}

          <Button
            Title={uploading ? 'Updating...' : 'Save changes'}
            BackgroundColor={'Primary'}
            TextColor={'Text3'}
            onPressChanges={handleSaveChanges}
            disabled={uploading}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default EditProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: colors.Background1,
    paddingHorizontal: 15,
  },
  fieldContainer: {
    width: '100%',
    marginBottom: 15,
  },
  label: {
    fontSize: 12,
    color: colors.Text2,
    fontFamily: fonts.Regular,
    marginBottom: 8,
  },

  input: {
    width: '100%',
    height: 50,
    borderWidth: 0.5,
    borderColor: colors.Outline,
    borderRadius: 12,
    paddingHorizontal: 12,
    fontSize: 12,
    color: colors.Text1,
    justifyContent: 'center',
  },

  textArea: {
    padding: 12,
    borderWidth: 0.5,
    borderColor: colors.Outline,
    borderRadius: 12,
    textAlignVertical: 'top',
    fontSize: 12,
    fontFamily: fonts.Regular,
    backgroundColor: colors.Background1,
  },
  errorText: {
    width: '100%',
    color: 'red',
    fontSize: 13,
    marginTop: 5,
    paddingLeft: 2,
  },
  helperText: {
    color: colors.Highlight2,
    fontSize: 10,
    marginTop: 5,
  },
});
