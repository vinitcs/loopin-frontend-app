import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {Icon} from '@rneui/themed';
import React, {useCallback, useMemo, useEffect, useRef, useState} from 'react';
import {logout} from '../redux/slices/authSlice';
import EncryptedStorage from 'react-native-encrypted-storage';
import api from '../api/apiInstance';
import {useDispatch, useSelector} from 'react-redux';
import {useFocusEffect} from '@react-navigation/native';
import {colors} from '../theme/colors/colors';
import Header from '../components/Custom/Header';
import {fonts} from '../theme/fonts/fonts';
import {setAllLoggedUserContent} from '../redux/slices/contentSlice';
import {SinglePostCard} from '../components/Card/SinglePostCard';
import {useMediaPicker} from '../utils/Media/useMediaPicker';
import Toast from 'react-native-toast-message';

const {height: screenHeight} = Dimensions.get('window');

const ProfileScreen = ({bottomSheetRef}) => {
  const dispatch = useDispatch();
  const {pickFromCamera, pickFromGallery} = useMediaPicker();

  const [profileData, setProfileData] = useState([]);
  const [bioExpand, setBioExpand] = useState(false);

  const [avatarFile, setAvatarFile] = useState([]);

  console.log('AVATAR UPDATE FILE:::', avatarFile[0]);

  const {allLoggedUserContent} = useSelector(state => state.content);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [focusedPostId, setFocusedPostId] = useState(null);

  const [activeTab, setActiveTab] = useState('Posts');

  const limit = 10;
  const isFetchingRef = useRef(false);

  console.log('log user data:::', profileData);

  const handlePickFromCamera = async () => {
    const imgFile = await pickFromCamera({type: 'photo'});
    setAvatarFile(imgFile);
  };

  const handlePickFromGallery = async () => {
    const imgFile = await pickFromGallery({type: 'photo'});
    setAvatarFile(imgFile);
  };

  const openPickerSheet = () => {
    bottomSheetRef.current?.openSheet(
      'media',
      {
        onCameraPress: handlePickFromCamera,
        onGalleryPress: handlePickFromGallery,
      },
      ['30%'],
    );
  };

  const fetchProfileData = async () => {
    try {
      const token = await EncryptedStorage.getItem('AccessToken');

      if (!token) {
        dispatch(logout());
        return;
      }

      const res = await api.get('/api/v1/user/profile');

      console.log('logged user profile data:::', res.data);

      if (res.data.success) {
        const user = {
          name: res.data.name,
          nameTag: res.data.nameTag,
          followersCount: res.data.followersCount,
          followingCount: res.data.followingCount,
          postCount: res.data.postCount || 0,
          avatar: res.data.avatar,
          bio: res.data.bio,
        };
        setProfileData(user);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        await EncryptedStorage.removeItem('AccessToken');
      } else {
        Toast.show({
          type: 'error',
          text1:
            error.response?.data?.message ||
            'Error while fetching profile data',
        });
      }
    }
  };

  const fetchLoggedUserContent = async (page = 1, refresh = false) => {
    if (isFetchingRef.current) return;

    try {
      isFetchingRef.current = true;

      if (refresh) {
        setIsRefreshing(true);
      } else if (page > 1) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }

      const token = await EncryptedStorage.getItem('AccessToken');

      if (!token) {
        dispatch(logout());
        return;
      }

      const res = await api.get(`/api/v1/post/all?page=${page}&limit=${limit}`);

      console.log('Logged user content data in profile:::', res.data);

      if (res.data.success) {
        const newLoggedUserContent = res.data.posts || [];

        if (page === 1) {
          dispatch(setAllLoggedUserContent(newLoggedUserContent));
          setCurrentPage(1);
          setHasMoreData(newLoggedUserContent.length === limit);
        } else {
          const existingIds = new Set(
            allLoggedUserContent.map(content => content._id),
          );
          const uniqueNewLoggedUserContent = newLoggedUserContent.filter(
            content => !existingIds.has(content._id),
          );

          if (uniqueNewLoggedUserContent.length > 0) {
            dispatch(
              setAllLoggedUserContent([
                ...allLoggedUserContent,
                ...uniqueNewLoggedUserContent,
              ]),
            );
            setCurrentPage(page);
            setHasMoreData(newLoggedUserContent.length === limit);
          }
        }
      }
    } catch (error) {
      if (error.response?.status === 401) {
        await EncryptedStorage.removeItem('AccessToken');
      } else {
        Toast.show({
          type: 'error',
          text1: error.response?.data?.message || 'Error while fetching posts',
        });
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      setIsLoadingMore(false);
      isFetchingRef.current = false;
    }
  };

  const handleUpdateUserAvatar = async () => {
    if (!avatarFile[0]?.uri || !avatarFile[0]?.type) return;

    try {
      let avatarData = new FormData();

      avatarData.append('avatar', {
        uri: avatarFile[0].uri,
        name: avatarFile[0].fileName || `upload_${Date.now()}.jpg`,
        type: avatarFile[0].type,
      });

      const res = await api.patch(
        '/api/v1/user/profile/update/avatar',
        avatarData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      if (res.data?.success) {
        Toast.show({
          type: 'success',
          text1: res.data.message,
        });

        setAvatarFile([]);
        fetchProfileData();
      }
    } catch (error) {
      console.log('update user avatar error:::', error);

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
        await EncryptedStorage.removeItem('AccessToken');
      }

      if (commonClientErrors.includes(status)) {
        Toast.show({
          type: 'error',
          text1:
            error?.response?.data?.message ||
            'Error while updating user avatar ',
        });
      }
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchProfileData();
      if (allLoggedUserContent.length === 0) {
        fetchLoggedUserContent(1);
      }
    }, [allLoggedUserContent.length]),
  );

  useEffect(() => {
    if (!avatarFile?.[0]?.uri) return;
    handleUpdateUserAvatar();
  }, [avatarFile]);

  useEffect(() => {
    if (allLoggedUserContent.length > 0) {
      setFocusedPostId(allLoggedUserContent[0]._id);
    }
  }, [allLoggedUserContent]);

  // Detect which post is visible
  const onViewableItemsChanged = useRef(({viewableItems}) => {
    console.log(
      'viewable:',
      viewableItems.map(v => v.item),
    );

    if (viewableItems.length > 0) {
      const visiblePost = viewableItems.find(v => v.item && v.item._id);

      if (visiblePost) {
        setFocusedPostId(visiblePost.item._id);
      }
    }
  }).current;

  const viewabilityConfig = useRef({itemVisiblePercentThreshold: 70}).current;

  // Infinite Scroll
  const handleLoadMore = useCallback(() => {
    if (!isLoadingMore && !isLoading && hasMoreData && !isFetchingRef.current) {
      fetchLoggedUserContent(currentPage + 1);
    }
  }, [isLoadingMore, isLoading, hasMoreData, currentPage]);

  const renderProfileHeader = () => {
    return (
      <View style={styles.contentWrapper}>
        <View style={styles.profileSection}>
          <View style={styles.profileSectionHero}>
            <View style={styles.profileAvatarSection}>
              {profileData?.avatar ? (
                <Image
                  style={styles.userAvatar}
                  source={{uri: profileData?.avatar}}
                />
              ) : (
                <Image
                  source={require('../assets/blank-profile-pic.png')}
                  style={styles.userAvatar}
                />
              )}
              <TouchableOpacity
                style={styles.avatarEditBtn}
                onPress={openPickerSheet}>
                <Icon name="add-outline" type="ionicon" size={16} />
              </TouchableOpacity>
            </View>

            <View style={styles.profileInfo}>
              <View style={styles.userProfileHandle}>
                <Text style={styles.userName}>{profileData?.name}</Text>
                <Text style={styles.userNameTag}>{profileData?.nameTag}</Text>
              </View>

              <View style={styles.profileInfoStatsSection}>
                <View style={styles.profileStatsPair}>
                  <Text style={styles.statsValue}>
                    {profileData?.postCount}
                  </Text>
                  <Text style={styles.statsLabel}>Posts</Text>
                </View>
                <View style={styles.profileStatsPair}>
                  <Text style={styles.statsValue}>
                    {profileData?.followersCount}
                  </Text>
                  <Text style={styles.statsLabel}>Followers</Text>
                </View>
                <View style={styles.profileStatsPair}>
                  <Text style={styles.statsValue}>
                    {profileData?.followingCount}
                  </Text>
                  <Text style={styles.statsLabel}>Followings</Text>
                </View>
              </View>
            </View>
          </View>
          <View style={styles.bioSection}>
            {!bioExpand && (
              <Text numberOfLines={3} style={styles.bioText}>
                {profileData?.bio}
              </Text>
            )}

            {bioExpand && (
              <ScrollView
                style={{maxHeight: 70}} // 6 lines approx
                showsVerticalScrollIndicator={true}>
                <Text style={styles.bioText}>{profileData?.bio}</Text>
              </ScrollView>
            )}

            {profileData?.bio?.length > 150 && (
              <TouchableOpacity
                style={styles.bioExpandbtn}
                onPress={() => setBioExpand(!bioExpand)}>
                <Text style={styles.bioExpandLabel}>
                  {bioExpand ? 'Read Less' : 'Read More'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
          {/* <View style={styles.actionSection}> */}

          {/* </View> */}
        </View>
      </View>
    );
  };

  const TabsHeader = ({activeTab, setActiveTab}) => {
    const tabs = ['Posts'];

    return (
      <View style={styles.tabsContainer}>
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}>
            <Text
              style={[
                styles.tabLabel,
                activeTab === tab && styles.tabLabelActive,
              ]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderItem = useCallback(
    ({item}) => {
      if (item.type === 'tabs') {
        return <TabsHeader activeTab={activeTab} setActiveTab={setActiveTab} />;
      }

      return (
        <SinglePostCard
          userInfo={item.userProfile}
          postId={item._id}
          postMedia={item.media}
          postDescription={item.description}
          isLiked={item.isLiked}
          postLikeCount={item.likeCount}
          postCommentCount={item.commentCount}
          postDate={item.createdAt}
          isLoggedUserCreated={item.isLoggedUserCreated}
          isLoggedUserFollow={item.isLoggedUserFollow}
          hashTags={item.hashTags}
          mentionedUsersCount={item.mentionedUsersCount}
          isFocused={item._id === focusedPostId}
          bottomSheetRef={bottomSheetRef}
        />
      );
    },
    [focusedPostId, bottomSheetRef, activeTab],
  );

  // Footer component for loading more posts
  const renderFooter = useMemo(
    () => () => {
      if (!hasMoreData) return null;

      return (
        <View style={styles.footerLoader}>
          <ActivityIndicator size="small" color="#1565c0" />
          <Text style={styles.footerLoaderText}>Loading more posts...</Text>
        </View>
      );
    },
    [isLoadingMore, hasMoreData],
  );

  const filteredContent = useMemo(() => {
    switch (activeTab) {
      default:
        return allLoggedUserContent;
    }
  }, [activeTab, allLoggedUserContent]);

  const listData = useMemo(() => {
    return [{type: 'tabs'}, ...filteredContent];
  }, [filteredContent]);

  const renderLoggedUserContent = () => {
    if (isLoading && !isRefreshing) {
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
        data={listData}
        keyExtractor={(item, index) => item._id || `tabs-${index}`}
        renderItem={renderItem}
        ItemSeparatorComponent={({leadingItem}) =>
          leadingItem.type === 'tabs' ? null : <View style={styles.separator} />
        }
        ListEmptyComponent={() => (
          <Text style={styles.emptyText}>No data available</Text>
        )}
        ListFooterComponent={renderFooter}
        refreshing={isRefreshing}
        onRefresh={() => fetchLoggedUserContent(1, true)}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.2}
        maxToRenderPerBatch={5}
        updateCellsBatchingPeriod={100}
        initialNumToRender={10}
        windowSize={20}
        removeClippedSubviews={false}
        ListHeaderComponent={renderProfileHeader}
        stickyHeaderIndices={[1]} // 0 → Profile, 1 → Tabs
        showsVerticalScrollIndicator={true}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
      />
    );
  };

  return (
    <View style={styles.container}>
      <Header
        showAppLogo={true}
        showEllipsisVertical={true}
        bottomSheetRef={bottomSheetRef}
      />
      {renderLoggedUserContent()}
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.Background1,
  },
  scrollView: {
    flexGrow: 1,
    // justifyContent: 'center',
  },
  contentWrapper: {
    // minHeight: screenHeight - 100,
    // justifyContent: 'center',
  },
  profileSection: {
    paddingHorizontal: 15,
    gap: 10,
  },
  profileSectionHero: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 20,
    gap: 18,
  },
  profileAvatarSection: {
    // backgroundColor: 'orange',
    // position: 'relative',
  },
  userAvatar: {
    width: 80,
    height: 80,
    borderRadius: 60,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarEditBtn: {
    position: 'absolute',
    bottom: 0,
    right: 10,
    backgroundColor: colors.Background1,
    padding: 2,
    borderRadius: 12,
  },

  profileInfo: {
    // backgroundColor: 'pink',
    flexGrow: 1,
    gap: 6,
  },

  userProfileHandle: {
    // backgroundColor: 'yellow',
    paddingTop: 2,
    flexDirection: 'column',
  },

  userName: {
    fontFamily: fonts.SemiBold,
    color: colors.Text1,
    fontSize: 16,
  },

  userNameTag: {
    fontFamily: fonts.Medium,
    color: colors.Text2,
    fontSize: 12,
  },

  profileInfoStatsSection: {
    // backgroundColor: 'yellow',
    flexDirection: 'row',
    flexGrow: 1,
    // justifyContent: 'space-between',
    gap: 30,
  },
  profileStatsPair: {
    flexDirection: 'column',
  },

  statsLabel: {
    fontFamily: fonts.SemiBold,
    fontSize: 12,
    color: colors.Text2,
  },
  statsValue: {
    fontFamily: fonts.SemiBold,
    fontSize: 16,
    color: colors.Text1,
  },
  actionSection: {
    backgroundColor: 'orange',
  },
  bioSection: {
    marginBottom: 40,
  },
  bioText: {
    fontSize: 12,
    fontFamily: fonts.Medium,
    color: colors.Text1
  },
  bioExpandbtn: {
    alignSelf: 'flex-start',
  },
  bioExpandLabel: {
    // backgroundColor: 'orange',
    paddingRight: 6,
    fontSize: 10,
    color: colors.Text2,
    fontFamily: fonts.SemiBold,
  },

  tabsContainer: {
    backgroundColor: colors.Background1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 0.5,
    borderColor: colors.Outline,
  },

  tabBtn: {
    paddingVertical: 6,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  tabBtnActive: {
    backgroundColor: colors.Background3,
  },
  tabLabel: {
    fontSize: 12,
    color: colors.Text2,
    fontFamily: fonts.SemiBold,
  },
  tabLabelActive: {
    color: colors.Primary,
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
});
