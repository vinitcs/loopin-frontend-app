import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  FlatList,
  Dimensions,
} from 'react-native';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {setAllContent} from '../redux/slices/contentSlice';
import {useDispatch, useSelector} from 'react-redux';
import EncryptedStorage from 'react-native-encrypted-storage';
import {login, logout} from '../redux/slices/authSlice';
import api from '../api/apiInstance';
import {SinglePostCard} from '../components/Card/SinglePostCard';
import {colors} from '../theme/colors/colors';
import Header from '../components/Custom/Header';
import {useFocusEffect} from '@react-navigation/native';
import Toast from 'react-native-toast-message';

const {height: screenHeight} = Dimensions.get('window');

const HomeScreen = ({bottomSheetRef}) => {
  const {allContent} = useSelector(state => state.content);
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [focusedPostId, setFocusedPostId] = useState(null);

  const limit = 10;
  const isFetchingRef = useRef(false);

  const fetchContent = async (page = 1, refresh = false) => {
    // Prevent multiple simultaneous requests

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

      const res = await api.get(
        `/api/v1/display/feed?page=${page}&limit=${limit}`,
      );

      console.log('content data:::', res.data);

      if (res.data.success) {
        const newContent = res.data.content || [];

        if (refresh || page === 1) {
          // Reset posts for refresh or initial load
          dispatch(setAllContent(newContent));
          setCurrentPage(1);
          setHasMoreData(newContent.length === limit);
        } else {
          // Append new posts for infinite scroll
          const existingIds = new Set(allContent.map(content => content._id));
          const uniqueNewContent = newContent.filter(
            content => !existingIds.has(content._id),
          );

          if (uniqueNewContent.length > 0) {
            dispatch(setAllContent([...allContent, ...uniqueNewContent]));
          }

          setCurrentPage(page);
          setHasMoreData(newContent.length === limit);
        }
      }
    } catch (error) {
      const status = error?.response?.status;
      const commonClientErrors = [400, 401, 403, 404];
      if (commonClientErrors.includes(status)) {
        await EncryptedStorage.removeItem('AccessToken');
      } else {
        Toast.show({
          type: 'error',
          text1: error?.response?.data?.message || 'Error while fetching posts',
        });
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      setIsLoadingMore(false);
      isFetchingRef.current = false;
    }
  };

  // useEffect(() => {
  //   fetchContent(1);
  // }, []);

  useFocusEffect(
    useCallback(() => {
      fetchContent(1);
    }, []),
  );

  useEffect(() => {
    if (allContent.length > 0) {
      setFocusedPostId(allContent[0]._id);
    }
  }, [allContent]);

  // Detect which post is visible
  const onViewableItemsChanged = useRef(({viewableItems}) => {
    if (viewableItems.length > 0) {
      const visiblePost = viewableItems[0].item;
      setFocusedPostId(visiblePost._id);
    }
  }).current;

  const viewabilityConfig = useRef({itemVisiblePercentThreshold: 70}).current;

  // Infinite Scroll
  const handleLoadMore = useCallback(() => {
    if (!isLoadingMore && !isLoading && hasMoreData && !isFetchingRef.current) {
      fetchContent(currentPage + 1);
    }
  }, [isLoadingMore, isLoading, hasMoreData, currentPage]);

  // Optimized render item
  const renderItem = useCallback(
    ({item}) => (
      // console.log('single post card component prop:::', item.media),
      console.log('Home render'),
      (
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
          mentionedUsers={item.mentionedUsers}
          isFocused={item._id === focusedPostId}
          bottomSheetRef={bottomSheetRef}
        />
      )
    ),
    [focusedPostId, bottomSheetRef],
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

  const renderContent = () => {
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
        data={allContent}
        keyExtractor={item => item._id}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={() => (
          <Text style={styles.emptyText}>No data available</Text>
        )}
        ListFooterComponent={renderFooter}
        refreshing={isRefreshing}
        onRefresh={() => fetchContent(1, true)}
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
      <Header showAppLogo={true} showBell={false} />
      <View style={styles.contentWrapper}>{renderContent()}</View>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.Background1,
    flex: 1,
  },
  contentWrapper: {
    // backgroundColor:'purple',
    flex: 1,
    // paddingTop: 10, // space between header and list
  },
  centerLoader: {
    marginTop: 40,
  },
  separator: {
    // backgroundColor: 'pink',
    height: 10,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    color: colors.Text2,
  },
  footerLoader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    borderRadius: 12,
    marginHorizontal: 20,
    marginTop: 10,
  },
  footerLoaderText: {
    marginLeft: 10,
    fontSize: 14,
    color: colors.Highlight1,
    fontWeight: '500',
  },
});
