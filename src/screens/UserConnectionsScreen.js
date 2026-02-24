import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';
import {colors} from '../theme/colors/colors';
import Header from '../components/Custom/Header';
import {fonts} from '../theme/fonts/fonts';
import Toast from 'react-native-toast-message';
import api from '../api/apiInstance';
import {useNavigation} from '@react-navigation/native';

const UserConnectionsScreen = ({route}) => {
  const {type: initialType} = route.params;
  // console.log('user connection ', type);

  const [activeTab, setActiveTab] = useState(initialType || 'followers');
  const [followersData, setFollowersData] = useState([]);
  const [followingsData, setFollowingsData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [followersPage, setFollowersPage] = useState(1);
  const [followingsPage, setFollowingsPage] = useState(1);
  const [followersHasMore, setFollowersHasMore] = useState(true);
  const [followingsHasMore, setFollowingsHasMore] = useState(true);

  const [followLoadingIds, setFollowLoadingIds] = useState([]);

  // console.log(followersData);

  const limit = 20;
  const navigation = useNavigation();

  const fetchFollowersList = async (page = 1) => {
    if (isLoading) return;

    try {
      setIsLoading(true);

      const res = await api.get(
        `/api/v1/user/followers?page=${page}&limit=${limit}`,
      );

      if (res.data.success) {
        const followersUsersList = res.data.followers || [];

        if (page === 1) {
          setFollowersData(followersUsersList);
        } else {
          setFollowersData(prev => [...prev, ...followersUsersList]);
        }

        setFollowersHasMore(followersUsersList.length === limit);
        setFollowersPage(page);
      } else {
        setFollowersData([]);
        return;
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
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFollowingsList = async (page = 1) => {
    if (isLoading) return;

    try {
      setIsLoading(true);

      const res = await api.get(
        `/api/v1/user/followings?page=${page}&limit=${limit}`,
      );

      if (res.data.success) {
        const followingUsersList = res.data.followings || [];

        if (page === 1) {
          setFollowingsData(followingUsersList);
        } else {
          setFollowingsData(prev => [...prev, ...followingUsersList]);
        }

        setFollowingsHasMore(followingUsersList.length === limit);
        setFollowingsPage(page);
      } else {
        setFollowingsData([]);
        return;
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
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFollowersList(1);
    fetchFollowingsList(1);
  }, []);

  const handleLoadMore = useCallback(() => {
    if (isLoading) return;
    if (activeTab === 'followers' && followersHasMore) {
      fetchFollowersList(followersPage + 1);
    } else if (activeTab === 'followings' && followingsHasMore) {
      fetchFollowingsList(followingsPage + 1);
    }
  }, [
    isLoading,
    activeTab,
    followersHasMore,
    followingsHasMore,
    followersPage,
    followingsPage,
  ]);

  // Updates the isLoggedUserFollow flag on the correct user in the correct list
  const updateFollowStatus = ({userId, isFollowing, tab}) => {
    const updater = list =>
      list.map(u =>
        u._id === userId ? {...u, isLoggedUserFollow: isFollowing} : u,
      );

    if (tab === 'followers') {
      setFollowersData(updater);
    } else {
      setFollowingsData(updater);
    }
  };

  const handleUserFollow = async (userId, currentStatus) => {
    // Prevent double tap
    if (followLoadingIds.includes(userId)) return;

    try {
      setFollowLoadingIds(prev => [...prev, userId]);

      const res = await api.post('/api/v1/user/follow-unfollow', {
        targetUserId: userId,
      });

      // console.log('Follow unFollow:::', res.data);

      if (res.data.success) {
        // Update both lists in case the user appears in both
        updateFollowStatus({
          userId,
          isFollowing: res.data.isLoggedUserFollow,
          tab: 'followers',
        });
        updateFollowStatus({
          userId,
          isFollowing: res.data.isLoggedUserFollow,
          tab: 'followings',
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
    } finally {
      // and every button gets permanently disabled after first tap
      setFollowLoadingIds(prev => prev.filter(id => id !== userId));
    }
  };

  const activeData = activeTab === 'followers' ? followersData : followingsData;

  const renderItem = useCallback(
    ({item}) => {
      // Each item uses its own isLoggedUserFollow field
      const isFollowing =
        activeTab === 'followings'
          ? item.isLoggedUserFollow ?? true
          : item.isLoggedUserFollow ?? false;
      // const isButtonLoading = followLoadingIds.includes(item._id);

      return (
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('VisitProfile', {targetUserId: item._id})
          }
          style={styles.userItem}>
          <View style={styles.cardContainer}>
            <Image
              source={
                item.avatar
                  ? {uri: item.avatar}
                  : require('../assets/blank-profile-pic.png')
              }
              style={styles.avatar}
            />
            <View>
              <Text style={styles.userName}>{item.name}</Text>
              <Text style={styles.userNameTag}>{item.nameTag || ''}</Text>
            </View>
          </View>

          {/* Only display button in followings list */}
          {/* {activeTab === 'followings' && ( */}
          <View style={styles.sectionPair}>
            <TouchableOpacity
              onPress={() => handleUserFollow(item._id)}
              style={[
                styles.followBtn,
                isFollowing
                  ? {backgroundColor: colors.Outline}
                  : {backgroundColor: colors.Primary},
              ]}>
              <Text
                style={[
                  styles.followBtnLabel,
                  isFollowing ? {color: colors.Text1} : {color: colors.Text3},
                ]}>
                {isFollowing ? 'Following' : 'Follow'}
              </Text>
            </TouchableOpacity>
          </View>
          {/* )} */}
        </TouchableOpacity>
      );
    },
    [activeTab, followLoadingIds, followersData, followingsData],
  );

  const renderContent = () => {
    if (isLoading && activeData.length === 0) {
      return (
        <ActivityIndicator
          size="large"
          color={colors.Primary}
          style={styles.centerLoader}
        />
      );
    }

    return (
      <FlatList
        key={activeTab}
        data={activeData}
        keyExtractor={item => item._id}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={() => (
          <Text style={styles.emptyText}>No data available</Text>
        )}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.2}
        maxToRenderPerBatch={5}
        updateCellsBatchingPeriod={100}
      />
    );
  };

  return (
    <View style={styles.container}>
      <Header
        showAppLogo={false}
        showTitle={true}
        titleContent={'Connections'}
      />

      {/* Tab Switcher */}
      <View style={styles.tabContainer}>
        {['followers', 'followings'].map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}>
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.activeTabText,
              ]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.contentWrapper}>{renderContent()}</View>
    </View>
  );
};

export default UserConnectionsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.Background1,
  },
  contentWrapper: {
    // backgroundColor:'purple',
    flex: 1,
    // paddingTop: 10, // space between header and list
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 15,
    marginVertical: 12,
    backgroundColor: colors.Background3,
    borderRadius: 10,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: colors.Primary,
  },
  tabText: {
    fontSize: 14,
    fontFamily: fonts.Medium,
    color: colors.Text2,
  },
  activeTabText: {
    color: colors.Background1,
    fontFamily: fonts.SemiBold,
  },
  centerLoader: {
    marginTop: 40,
  },
  separator: {
    // backgroundColor: 'pink',
    height: 10,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    color: colors.Text2,
  },
  title: {
    fontSize: 16,
    fontFamily: fonts.Medium,
    color: colors.Text2,
    marginBottom: 15,
    textAlign: 'center',
  },

  userItem: {
    backgroundColor: colors.Background3,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    marginHorizontal: 15,
    borderColor: colors.Outline,
    borderRadius: 12,
  },
  cardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    backgroundColor: colors.Background3,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
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
  sectionPair: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  followBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  followBtnLabel: {
    fontSize: 12,
    fontFamily: fonts.Regular,
  },
});
