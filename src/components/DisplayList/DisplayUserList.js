import {StyleSheet, Text, TouchableOpacity, View, Image} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';
import {BottomSheetFlatList} from '@gorhom/bottom-sheet';
import {fonts} from '../../theme/fonts/fonts';
import {colors} from '../../theme/colors/colors';
import api from '../../api/apiInstance';
import Toast from 'react-native-toast-message';

const DisplayUserList = ({postId}) => {
  const [users, setUsers] = useState([]);

  console.log('Display mention users:::', users);

  const fetchMentionUsers = async () => {
    try {
      const res = await api.get(`/api/v1/post/mention-users/${postId}`);

      console.log('mention users--->', res.data);
      if (res.data.success) {
        setUsers(res.data.postMentionUsers || []);
      }
    } catch (error) {
      const status = error?.response?.status;

      const commonClientErrors = [400, 401, 403, 404];

      if (commonClientErrors.includes(status)) {
        return Toast.show({
          type: 'error',
          text1: error.response?.data?.message || 'Invalid request',
        });
      }

      if (status >= 500) {
        return Toast.show({
          type: 'error',
          text1: 'Server error. Please try again.',
        });
      }

      return Toast.show({
        type: 'error',
        text1: error.message || 'Something went wrong. Please try again.',
      });
    }
  };

  const handleUserFollow = async userId => {
    try {
      const res = await api.post('/api/v1/user/follow-unfollow', {
        targetUserId: userId,
      });

      // console.log('Follow unFollow:::', res.data);

      if (res.data.success) {
        setUsers(prev => {
          const updated = prev.map(u =>
            u._id === userId
              ? {...u, isLoggedUserFollow: res.data.isLoggedUserFollow}
              : u,
          );

          return [...updated];
        });

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
      const status = error?.response?.status;

      const commonClientErrors = [400, 401, 403, 404];

      if (commonClientErrors.includes(status)) {
        return Toast.show({
          type: 'error',
          text1: error.response?.data?.message || 'Invalid request',
        });
      }

      if (status >= 500) {
        return Toast.show({
          type: 'error',
          text1: 'Server error. Please try again.',
        });
      }

      return Toast.show({
        type: 'error',
        text1: error.message || 'Something went wrong. Please try again.',
      });
    }
  };

  useEffect(() => {
    fetchMentionUsers();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mentions</Text>
      <BottomSheetFlatList
        data={users}
        contentContainerStyle={styles.listSection}
        keyExtractor={item => item._id?.toString()}
        extraData={users}
        renderItem={({item}) => (
          <TouchableOpacity style={styles.userItem}>
            <View style={styles.cardContainer}>
              <View style={styles.sectionPair}>
                <Image
                  source={
                    item.avatar
                      ? {uri: item.avatar}
                      : require('../../assets/blank-profile-pic.png')
                  }
                  style={styles.avatar}
                />
                <View>
                  <Text style={styles.userName}>{item.name}</Text>
                  <Text style={styles.userNameTag}>{item.nameTag || ''}</Text>
                </View>
              </View>
              {!item.isLoggedUserProfile && (
                <View style={styles.sectionPair}>
                  <TouchableOpacity
                    onPress={() => handleUserFollow(item._id)}
                    style={[
                      styles.followBtn,
                      item.isLoggedUserFollow
                        ? {backgroundColor: colors.Outline}
                        : {backgroundColor: colors.Primary},
                    ]}>
                    <Text
                      style={[
                        styles.followBtnLabel,
                        item.isLoggedUserFollow
                          ? {color: colors.Text1}
                          : {
                              color: colors.Text3,
                            },
                      ]}>
                      {item.isLoggedUserFollow ? 'Following' : 'Follow'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </TouchableOpacity>
        )}
        showsHorizontalScrollIndicator={true}
      />
    </View>
  );
};

export default DisplayUserList;

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
  listSection: {
    gap: 12,
  },
  userItem: {
    backgroundColor: colors.Background3,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderColor: colors.Outline,
    borderRadius: 12,
  },
  cardContainer: {
    // backgroundColor: 'orange',
    flexGrow: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sectionPair: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: colors.Background1,
  },
  userName: {
    fontSize: 14,
    color: colors.Text1,
    fontFamily: fonts.SemiBold,
  },
  userNameTag: {
    fontSize: 12,
    color: colors.Text2,
    fontFamily: fonts.Regular,
  },

  followBtn: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  followBtnLabel: {
    fontSize: 12,
    fontFamily: fonts.Regular,
  },
});
