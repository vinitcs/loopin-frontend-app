import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  TouchableOpacity,
  Image,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {fonts} from '../../theme/fonts/fonts';
import {colors} from '../../theme/colors/colors';
import UserInput from '../Credentials/UserInput';
import {BottomSheetFlatList} from '@gorhom/bottom-sheet';
import api from '../../api/apiInstance';
import Toast from 'react-native-toast-message';
import EncryptedStorage from 'react-native-encrypted-storage';

const SearchUser = ({
  selectedUser = [],
  onSelectUser,
  placeholder = 'Search User',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const limit = 20;

  const [debounceTimer, setDebounceTimer] = useState(null);

  const fetchUsers = async (page = 1, search = '') => {
    if (isLoading) return;

    try {
      setIsLoading(true);

      if (searchQuery.length > 0) {
        const res = await api.get(
          `/api/v1/action/search?term=${search}&page=${page}&limit=${limit}`,
        );

        if (res.data.success) {
          const usersList = res.data.users || [];

          if (page === 1) {
            setUsers(usersList);
          } else {
            setUsers(prev => [...prev, ...usersList]);
          }

          setHasMore(usersList.length === limit);
          setCurrentPage(page);
        }
      } else {
        setUsers([]);
        return;
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
          text1: error.errorMessage || 'Failed to fetch users.',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced Search
  useEffect(() => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    const timer = setTimeout(() => {
      fetchUsers(1, searchQuery);
    }, 500);

    setDebounceTimer(timer);

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [searchQuery]);

  const handleSelectUser = user => {
    onSelectUser(user);
  };

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      fetchUsers(currentPage + 1, searchQuery);
    }
  };

  const renderFooter = () => {
    if (!isLoading) return null;
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="small" color={colors.Primary} />
      </View>
    );
  };

  const isUserSelected = userId => {
    return (
      Array.isArray(selectedUser) && selectedUser.some(u => u?._id === userId)
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Text style={styles.title}>Search User</Text>

      {/* Search Input */}
      <UserInput
        placeholder={placeholder}
        leftIcon={'leftIcon'}
        leftIconName={'search-outline'}
        onChangeState={setSearchQuery}
      />

      {/* User List */}
      {isLoading && currentPage === 1 ? (
        <View style={styles.centerLoader}>
          <ActivityIndicator size="large" color={colors.Primary} />
          <Text>Loading users...</Text>
        </View>
      ) : (
        <BottomSheetFlatList
          data={users}
          contentContainerStyle={styles.listSection}
          keyExtractor={item => item._id?.toString()}
          extraData={selectedUser}
          renderItem={({item}) => {
            const selected = isUserSelected(item._id);
            return (
              <TouchableOpacity
                onPress={() => handleSelectUser(item)}
                style={[styles.userItem, selected && styles.selectedUserItem]}>
                <View style={styles.cardContainer}>
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
              </TouchableOpacity>
            );
          }}
          ListFooterComponent={renderFooter}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          showsVerticalScrollIndicator={true}
        />
      )}
    </View>
  );
};

export default SearchUser;

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
  centerLoader: {
    padding: 40,
    alignItems: 'center',
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
  selectedUserItem: {
    borderWidth: 0.5,
    borderColor: colors.Highlight3,
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
  loaderContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});
