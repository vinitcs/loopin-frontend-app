import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {colors} from '../theme/colors/colors';
import {fonts} from '../theme/fonts/fonts';
import UserInput from '../components/Credentials/UserInput';
import Toast from 'react-native-toast-message';
import EncryptedStorage from 'react-native-encrypted-storage';
import api from '../api/apiInstance';
import {SinglePostCard} from '../components/Card/SinglePostCard';
import {useFocusEffect, useNavigation} from '@react-navigation/native';

const SearchScreen = ({bottomSheetRef}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('');
  const [searchData, setSearchData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [focusedPostId, setFocusedPostId] = useState(null);

  const limit = 20;
  const debounceTimer = useRef(null);
  const previousTabRef = useRef('Search');
  const navigation = useNavigation();
  const isLoadingRef = useRef(false);

  console.log('Search data ///////', searchData);

  const fetchSearchData = useCallback(
    async (page = 1, search = '', type = '') => {
      if (isLoadingRef.current) return;

      try {
        isLoadingRef.current = true;
        setIsLoading(true);

        if (search.length > 0) {
          const res = await api.get(
            `/api/v1/action/global/search?term=${search}&type=${type}&page=${page}&limit=${limit}`,
          );

          if (res.data.success) {
            const searchResultList = res.data.searchData || [];

            if (page === 1) {
              setSearchData(searchResultList);
            } else {
              setIsLoadingMore(true);
              setSearchData(prev => [...prev, ...searchResultList]);
            }

            setHasMore(searchResultList.length === limit);
            setCurrentPage(page);
          } else {
            if (page === 1) {
              setSearchData([]);
            }
          }
        } else {
          // Only clear if it's a new search (page 1)
          if (page === 1) {
            setSearchData([]);
          }
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
            text1: error.errorMessage || 'Failed to fetch data.',
          });
        }
      } finally {
        isLoadingRef.current = false;
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [],
  );

  // Debounced search
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      fetchSearchData(1, searchQuery);
    }, 500);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [searchQuery, fetchSearchData]);

  useEffect(() => {
    if (searchData.length > 0 && searchData[0].contentType === 'post') {
      const newId = searchData[0]._id;
      setFocusedPostId(prevId => (prevId !== newId ? newId : prevId));
    }
  }, [searchData]);

  useFocusEffect(
    useCallback(() => {
      // When Search screen gains focus
      const parent = navigation.getParent();
      const parentState = parent?.getState();

      if (parentState) {
        const currentRoute = parentState.routes[parentState.index];

        let currentTabName = currentRoute.name;

        // If we're inside the Tabs navigator, get the actual tab name
        if (currentRoute.name === 'Tabs' && currentRoute.state) {
          const tabState = currentRoute.state;
          currentTabName = tabState.routes[tabState.index]?.name;
        }

        // console.log(
        //   'Current Tab:',
        //   currentTabName,
        //   'Previous Tab:',
        //   previousTabRef.current,
        // );

        // Only clear if previous location was a DIFFERENT TAB (not a stack screen)
        const tabNames = [
          'Home',
          'Create',
          'Search',
          'Profile',
          'Notification',
        ];
        const wasPreviouslyOnDifferentTab =
          tabNames.includes(previousTabRef.current) &&
          previousTabRef.current !== 'Search';

        if (wasPreviouslyOnDifferentTab && currentTabName === 'Search') {
          setSearchQuery('');
          setSearchData([]);
          setCurrentPage(1);
        }

        // Update the previous tab reference
        previousTabRef.current = currentTabName;
      }

      return () => {
        // When Search loses focus, record the current location
        const parent = navigation.getParent();
        const parentState = parent?.getState();

        if (parentState) {
          const currentRoute = parentState.routes[parentState.index];

          let currentTabName = currentRoute.name;

          // If we're inside the Tabs navigator, get the actual tab name
          if (currentRoute.name === 'Tabs' && currentRoute.state) {
            const tabState = currentRoute.state;
            currentTabName = tabState.routes[tabState.index]?.name;
          }

          previousTabRef.current = currentTabName;
          console.log(
            'Cleanup - Setting previous location to:',
            currentTabName,
          );
        }
      };
    }, [navigation]),
  );

  // Detect which post is visible
  const onViewableItemsChanged = useRef(({viewableItems}) => {
    if (viewableItems && viewableItems.length > 0) {
      const visiblePost = viewableItems[0].item;
      setFocusedPostId(visiblePost._id);
    }
  }).current;

  const viewabilityConfig = useRef({itemVisiblePercentThreshold: 70}).current;

  // Infinite Scroll
  const handleLoadMore = useCallback(() => {
    if (
      !isLoadingMore &&
      !isLoadingRef.current &&
      hasMore &&
      searchQuery.length > 0
    ) {
      fetchSearchData(currentPage + 1, searchQuery);
    }
  }, [isLoadingMore, hasMore, currentPage, searchQuery, fetchSearchData]);

  const renderItem = useCallback(
    ({item}) =>
      item.contentType === 'post' ? (
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
      ) : (
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
        </TouchableOpacity>
      ),
    [focusedPostId, bottomSheetRef, navigation],
  );

  const keyExtractor = useCallback(item => item._id, []);

  const ItemSeparatorComponent = useCallback(
    () => <View style={styles.separator} />,
    [],
  );

  // Move this outside and make it stable
  const emptyText =
    searchQuery.length === 0 ? 'Start Searching' : 'No matching data';

  const ListEmptyComponent = useCallback(
    () => <Text style={styles.emptyText}>{emptyText}</Text>,
    [emptyText],
  );

  const renderContent = () => {
    if (isLoading && searchData.length === 0) {
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
        data={searchData}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ItemSeparatorComponent={ItemSeparatorComponent}
        ListEmptyComponent={ListEmptyComponent}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.2}
        maxToRenderPerBatch={5}
        updateCellsBatchingPeriod={100}
        initialNumToRender={10}
        windowSize={10}
        removeClippedSubviews={false}
        showsVerticalScrollIndicator={true}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
      />
    );
  };

  return (
    <View style={styles.container}>
      {/* User Input */}
      <View style={styles.searchSection}>
        <UserInput
          leftIcon={'leftIcon'}
          leftIconName={'search-outline'}
          placeholder={'Search post, user'}
          value={searchQuery}
          onChangeState={setSearchQuery}
        />
      </View>

      <View style={styles.contentWrapper}>{renderContent()}</View>
    </View>
  );
};

export default SearchScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    gap: 10,
    backgroundColor: colors.Background1,
    paddingTop: 10,
  },
  searchSection: {
    paddingHorizontal: 15,
  },
  title: {
    fontSize: 14,
    fontFamily: fonts.Medium,
    color: colors.Text2,
    marginBottom: 15,
    textAlign: 'center',
  },
  contentWrapper: {
    // backgroundColor:'purple',
    flex: 1,
    // paddingTop: 10, // space between header and list
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
  },
  avatar: {
    width: 40,
    height: 40,
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
});
