import React, {useCallback, useState, useRef} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Image,
} from 'react-native';
import EncryptedStorage from 'react-native-encrypted-storage';
import {Bell} from 'lucide-react-native';
import {useFocusEffect} from '@react-navigation/native';
import api from '../api/apiInstance';
import Toast from 'react-native-toast-message';
import {colors} from '../theme/colors/colors';
import Header from '../components/Custom/Header';
import {fonts} from '../theme/fonts/fonts';
import {getTimeAgo} from '../utils/DateTime/getTimeAgo';

const NotificationScreen = () => {
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [initialLoad, setInitialLoad] = useState(true);

  console.log('notificationssssss', notifications);

  // Refs to prevent multiple simultaneous requests
  const isLoadingMore = useRef(false);
  const isRefreshing = useRef(false);

  const limit = 10; // Slightly increased for better UX

  const fetchNotifications = async (pageNum = 1, isRefresh = false) => {
    // Prevent duplicate requests
    if (isRefresh && isRefreshing.current) return;
    if (!isRefresh && pageNum > 1 && isLoadingMore.current) return;
    if (loading && !isRefresh) return;

    try {
      if (isRefresh) {
        isRefreshing.current = true;
        setRefreshing(true);
      } else if (pageNum === 1) {
        setLoading(true);
      } else {
        isLoadingMore.current = true;
        setLoadingMore(true);
      }

      const res = await api.get(
        `/api/v1/notification/all?page=${pageNum}&limit=${limit}`,
      );

      if (res.data.success) {
        const fetched = res.data.notifications || [];

        if (isRefresh) {
          setNotifications(fetched);
          setPage(2); // Reset to page 2 for next load
        } else if (pageNum === 1) {
          setNotifications(fetched);
          setPage(2);
        } else {
          // Remove duplicates before adding
          setNotifications(prev => {
            const existingIds = new Set(prev.map(n => n._id));
            const newNotifications = fetched.filter(
              n => !existingIds.has(n._id),
            );
            return [...prev, ...newNotifications];
          });
          setPage(pageNum + 1);
        }

        // Check if we have more data
        setHasMore(fetched.length === limit);
      }
    } catch (err) {
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
          text1: error?.response?.data?.message || 'Error while creating post',
        });
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
      setInitialLoad(false);
      isLoadingMore.current = false;
      isRefreshing.current = false;
    }
  };

  const handleRefresh = useCallback(() => {
    if (isRefreshing.current) return;
    setPage(1);
    setHasMore(true);
    fetchNotifications(1, true);
  }, []);

  const handleLoadMore = useCallback(() => {
    if (hasMore && !isLoadingMore.current && !loading && !refreshing) {
      fetchNotifications(page);
    }
  }, [hasMore, page, loading, refreshing]);

  const markAsRead = async (id, item) => {
    // Optimistic update
    console.log('item', item);
    setNotifications(prev =>
      prev.map(n => (n._id === id ? {...n, isRead: true} : n)),
    );

    try {
      await api.patch(`/api/v1/notification/read`, {id});
    } catch (err) {
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
          text1: error?.response?.data?.message || 'Error while creating post',
        });
      }
    }
  };

  // Initial load
  useFocusEffect(
    useCallback(() => {
      if (notifications.length === 0) {
        fetchNotifications(1);
      }
    }, []),
  );

  const renderNotification = useCallback(
    ({item}) => (
      <TouchableOpacity
        onPress={() => markAsRead(item._id, item)}
        style={[styles.notificationCard, !item.isRead && styles.unreadCard]}
        activeOpacity={0.7}>
        {item.userProfile.avatar && (
          <Image
            source={
              item.userProfile.avatar
                ? {uri: item.userProfile.avatar}
                : require('../assets/blank-profile-pic.png')
            }
            style={styles.avatar}
          />
        )}

        <View style={styles.textContainer}>
          <Text
            style={[
              styles.notificationMessage,
              !item.isRead && styles.unreadMessage,
            ]}>
            {item.message}
          </Text>
        </View>
        <Text style={styles.notificationTime}>
          {getTimeAgo(item.createdAt)}
        </Text>
      </TouchableOpacity>
    ),
    [],
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color={colors.Primary} />
        <Text style={styles.loadingText}>Loading more...</Text>
      </View>
    );
  };

  const renderEmpty = () => {
    if (initialLoad || loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.Primary} />
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      );
    }
    return (
      <View style={styles.emptyContainer}>
        <Bell size={48} color={colors.Background3} />
        <Text style={styles.noDataText}>No notifications yet</Text>
        <Text style={styles.noDataSubtext}>
          We'll notify you when something happens
        </Text>
      </View>
    );
  };

  const keyExtractor = useCallback((item, index) => `${item._id}-${index}`, []);

  return (
    <View style={styles.container}>
      <Header showAppLogo={true} />
      <FlatList
        data={notifications}
        keyExtractor={keyExtractor}
        renderItem={renderNotification}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3} // Trigger earlier for smoother experience
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.Primary]} // Android
            tintColor={colors.Primary} // iOS
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          notifications.length === 0 ? styles.emptyListContainer : undefined
        }
        removeClippedSubviews={true} // Performance optimization
        maxToRenderPerBatch={10} // Performance optimization
        windowSize={10} // Performance optimization
        initialNumToRender={10} // Performance optimization
        getItemLayout={undefined} // Let FlatList handle this for dynamic content
      />
    </View>
  );
};

export default NotificationScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.Background1,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: colors.Background1,
    borderLeftWidth: 0.5,
    borderLeftColor: colors.Highlight1,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    marginHorizontal: 16,
  },
  unreadCard: {
    backgroundColor: colors.Background1,
    borderLeftWidth: 0.5,
    borderLeftColor: colors.Outline,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  bellIcon: {
    marginTop: 2,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  notificationMessage: {
    fontSize: 14,
    color: colors.Text1,
    lineHeight: 20,
  },
  unreadMessage: {
    color: colors.Text1,
    fontFamily: fonts.Regular,
  },
  notificationTime: {
    fontSize: 12,
    color: colors.Text1,
    marginLeft: 8,
    marginTop: 2,
  },
  loadingFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: colors.Text1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  emptyListContainer: {
    flexGrow: 1,
  },
  noDataText: {
    textAlign: 'center',
    fontSize: 18,
    color: colors.Text1,
  },
  noDataSubtext: {
    textAlign: 'center',
    fontSize: 14,
    color: colors.Text2,
    fontFamily: fonts.Regular,
    marginTop: 4,
  },
});
