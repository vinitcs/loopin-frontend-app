import {
  StyleSheet,
  View,
  TextInput,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';
import React, {useState} from 'react';
import {colors} from '../../theme/colors/colors';
import {fonts} from '../../theme/fonts/fonts';
import {Icon, Chip} from '@rneui/themed';
import CountryPicker from 'react-native-country-picker-modal';

const UserInput = ({
  focus,
  leftIcon,
  leftIconColor,
  leftIconName,
  rightIcon,
  rightIconColor,
  rightIconName,
  readOnly,
  isPassword,
  placeholder,
  value,
  showChips = true,
  chipType,
  chips = [],
  onChangeState,
  onRemoveChip,
  type = '',
}) => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [countryCode, setCountryCode] = useState('IN'); // Default India
  const [callingCode, setCallingCode] = useState('91');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [pickerVisible, setPickerVisible] = useState(false);
  // const [userTagList, setUserTagList] = useState([]);

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const handlePhoneChange = text => {
    setPhoneNumber(text);
    if (text.trim().length === 0) {
      onChangeState('');
    } else {
      const fullNumber = `+${callingCode}${text}`;
      onChangeState(fullNumber); // send full number to Register screen
    }
  };

  const onSelect = country => {
    setCountryCode(country.cca2);
    // setCallingCode(`+${country.callingCode[0]}`);
    setCallingCode(country.callingCode[0]);
    onChangeState(`+${country.callingCode[0]}${phoneNumber}`);
    setPickerVisible(false);
  };

  const renderUserChipItem = ({item}) => {
    return (
      <Chip
        // key={index}
        // title={item.name}
        type="outline"
        buttonStyle={styles.chipStyle}>
        <View style={styles.chipContent}>
          {/* LEFT AVATAR */}
          <Image
            source={
              item.avatar
                ? {uri: item.avatar}
                : require('../../assets/blank-profile-pic.png')
            }
            style={styles.chipUserAvatar}
          />

          {/* USER NAME */}
          <Text style={styles.chipText}>{item.name}</Text>

          {/* RIGHT CLOSE ICON */}
          {onRemoveChip && (
            <Icon
              name="close"
              type="ionicon"
              size={16}
              color={colors.Text2}
              onPress={() => onRemoveChip(item._id)}
              style={{marginLeft: 6}}
            />
          )}
        </View>
      </Chip>
    );
  };

  const renderHashtagChipItem = ({item}) => {
    console.log('render hashtag item*****', item);

    return (
      <Chip
        // key={index}
        title={item.original}
        type="outline"
        buttonStyle={styles.chipStyle}
        icon={
          <Icon
            name="close"
            type="ionicon"
            size={16}
            color={colors.Text2}
            onPress={() => onRemoveChip(item._id)}
            style={{marginLeft: 6}}
          />
        }
        iconRight={true}
      />
    );
  };

  let renderItemSelected;

  switch (chipType) {
    case 'user':
      renderItemSelected = renderUserChipItem;
      break;

    case 'hashtag':
      renderItemSelected = renderHashtagChipItem;
      break;

    default:
      renderItemSelected = () => null;
  }

  return (
    <View>
      <View style={styles.container}>
        {type === 'phone' ? (
          <View style={styles.countryContainer}>
            <TouchableOpacity
              onPress={() => setPickerVisible(true)}
              style={styles.callingCodeButton}>
              <Text style={styles.callingCodeText}>+{callingCode}</Text>
              <Icon
                name="chevron-down"
                type="ionicon"
                size={12}
                color={colors.lightText}
              />
            </TouchableOpacity>

            <CountryPicker
              countryCode={countryCode}
              withFilter
              withFlagButton={false}
              withFlag
              withEmoji
              withAlphaFilter={false}
              withCallingCode
              withCallingCodeButton={false}
              visible={pickerVisible}
              onSelect={onSelect}
              onClose={() => setPickerVisible(false)}
              // containerButtonStyle={styles.countryPicker}
            />

            <TextInput
              placeholder={placeholder}
              selectionColor={colors.lightText}
              keyboardType="phone-pad"
              value={phoneNumber}
              onChangeText={handlePhoneChange}
              style={styles.input}
            />
          </View>
        ) : (
          <>
            {leftIcon && (
              <Icon
                name={leftIconName}
                type="ionicon"
                size={20}
                color={leftIconColor}
                style={styles.icon}
              />
            )}

            {readOnly ? (
              <View style={styles.readOnlySection}>
                {showChips && chips.length > 0 ? (
                  <View style={styles.chipContainer}>
                    <FlatList
                      data={chips}
                      horizontal
                      showsHorizontalScrollIndicator={true}
                      keyExtractor={(item, index) => index.toString()}
                      contentContainerStyle={styles.chipListContainer}
                      renderItem={renderItemSelected}
                    />
                  </View>
                ) : (
                  <Text style={[value ? styles.readOnlyText : colors.Text2]}>
                    {value ? value : placeholder}
                  </Text>
                )}
              </View>
            ) : (
              <TextInput
                placeholder={placeholder}
                selectionColor={colors.lightText}
                autoFocus={focus}
                value={value}
                onChangeText={onChangeState}
                secureTextEntry={!passwordVisible && isPassword}
                style={styles.input}
              />
            )}

            {rightIcon && (
              <TouchableOpacity
                onPress={isPassword ? togglePasswordVisibility : onChangeState}>
                <Icon
                  name={
                    isPassword
                      ? passwordVisible
                        ? 'eye-outline'
                        : 'eye-off-outline'
                      : rightIconName
                  }
                  type="ionicon"
                  size={20}
                  color={rightIconColor}
                  style={styles.icon}
                />
              </TouchableOpacity>
            )}
          </>
        )}
      </View>
    </View>
  );
};

export default UserInput;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    borderWidth: 0.5,
    borderRadius: 12,
    borderColor: colors.Outline,
  },
  icon: {
    // backgroundColor: 'red',
    paddingRight: 6,
  },
  input: {
    flex: 1,
    color: colors.lightText,
    fontFamily: fonts.Medium,
    fontSize: 16,
    height: 50,
    paddingHorizontal: 10,
  },

  readOnlySection: {
    // backgroundColor: 'pink',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 5,
    alignItems: 'center',
    height: 50,
    lineHeight: 50,
    marginRight: 6,
  },

  readOnlyText: {
    color: colors.Text1,
    fontFamily: fonts.Medium,
    fontSize: 14,
  },

  countryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    // gap: 1
  },
  callingCodeButton: {
    // backgroundColor: colors.Accent,
    flexDirection: 'row',
    alignItems: 'center',
    // paddingRight: 8,
    gap: 2,
    marginRight: -6,
  },
  callingCodeText: {
    color: colors.Text1,
    fontFamily: fonts.SemiBold,
    fontSize: 14,
  },
  chipListContainer: {
    gap: 6,
  },
  chipContainer: {
    flexDirection: 'row',
  },

  chipStyle: {
    borderColor: colors.Outline,
    borderWidth: 0.5,
  },
  chipContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  chipUserAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 4,
  },

  chipText: {
    color: colors.lightText,
    fontFamily: fonts.Medium,
    fontSize: 14,
  },
});
