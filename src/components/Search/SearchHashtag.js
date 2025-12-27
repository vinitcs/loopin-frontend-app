import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {fonts} from '../../theme/fonts/fonts';
import {colors} from '../../theme/colors/colors';
import UserInput from '../Credentials/UserInput';
import {BottomSheetFlatList} from '@gorhom/bottom-sheet';
import api from '../../api/apiInstance';
import EncryptedStorage from 'react-native-encrypted-storage';
import Toast from 'react-native-toast-message';

const SearchHashtag = ({
  selectedHashtag = [],
  onSelectHashtag,
  placeholder = 'Search Hashtag',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [hashtags, setHashtags] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const limit = 20;

  const [debounceTimer, setDebounceTimer] = useState(null);

  const fetchHashtags = async (page = 1, search = '') => {
    if (isLoading) return;

    try {
      setIsLoading(true);

      if (searchQuery.length > 0) {
        const res = await api.get(
          `/api/v1/hashtag/recommend?term=${search}&page=${page}&limit=${limit}`,
        );

        console.log('hashtag list:::', res.data);

        if (res.data.success) {
          const hashtagsList = res.data.hashTags || [];

          if (page === 1) {
            setHashtags(hashtagsList);
          } else {
            setHashtags(prev => [...prev, ...hashtagsList]);
          }

          setHasMore(hashtagsList.length === limit);
          setCurrentPage(page);
        }
      } else {
        setHashtags([]);
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
          text1: error.errorMessage || 'Failed to fetch hashtags.',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // useEffect(() => {
  //   fetchHashtags(1, '');
  // }, []);

  // Debounced Search
  useEffect(() => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    const timer = setTimeout(() => {
      fetchHashtags(1, searchQuery);
    }, 500);

    setDebounceTimer(timer);

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [searchQuery]);

  const handleSelectHashtag = hashtag => {
    onSelectHashtag(hashtag);
  };

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      fetchHashtags(currentPage + 1, searchQuery);
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

  const isHashtagSelected = hashtagId => {
    console.log('hashtag id for logging-----', hashtagId);

    return (
      Array.isArray(selectedHashtag) &&
      selectedHashtag.some(h => h._id === hashtagId)
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Text style={styles.title}>Select Hashtag</Text>

      {/* Search Input */}
      <UserInput
        placeholder={placeholder}
        leftIcon={'leftIcon'}
        leftIconName={'search-outline'}
        onChangeState={setSearchQuery}
      />

      {/* Hashtag list */}
      {isLoading && currentPage === 1 ? (
        <View style={styles.centerLoader}>
          <ActivityIndicator size="large" color={colors.Primary} />
          <Text style={styles.loadingText}>Loading hashtags...</Text>
        </View>
      ) : (
        <BottomSheetFlatList
          data={hashtags}
          contentContainerStyle={styles.listSection}
          keyExtractor={item => item._id?.toString()}
          extraData={selectedHashtag}
          renderItem={({item}) => {
            const selected = isHashtagSelected(item._id);
            return (
              <TouchableOpacity
                onPress={() => handleSelectHashtag(item)}
                style={[
                  styles.hashtagItem,
                  selected && styles.selectedHashtagItem,
                ]}>
                <View style={styles.cardContainer}>
                  <Text style={styles.hashtagName}>{item.original}</Text>
                  <Text style={styles.hashtagUsage}>
                    Use by {item.usageCount}{' '}
                    {item.usageCount === 1 ? 'user' : 'users'}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {searchQuery
                  ? 'No hashtags found'
                  : 'Start typing to search hashtags'}
              </Text>

              {searchQuery.length > 0 && (
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => {
                    const newHashtag = `#${searchQuery.replace(/\s+/g, '')}`;

                    handleSelectHashtag({
                      _id: newHashtag,
                      original: newHashtag,
                    });
                  }}>
                  <Text style={styles.addButtonText}>
                    Add "{`#${searchQuery.replace(/\s+/g, '')}`}"
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
          ListFooterComponent={renderFooter}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          showsVerticalScrollIndicator={true}
        />
      )}
    </View>
  );
};

export default SearchHashtag;

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
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: colors.Text2,
    fontFamily: fonts.Regular,
  },
  listSection: {
    gap: 12,
  },
  hashtagItem: {
    backgroundColor: colors.Background3,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderColor: colors.Outline,
    borderRadius: 12,
  },
  selectedHashtagItem: {
    borderWidth: 0.5,
    borderColor: colors.Highlight3,
  },
  cardContainer: {
    flexDirection: 'column',
    // alignItems: 'center',
  },
  hashtagName: {
    fontSize: 16,
    fontFamily: fonts.SemiBold,
    color: colors.Text1,
    marginBottom: 4,
  },
  hashtagUsage: {
    fontSize: 10,
    color: colors.Text2,
    fontFamily: fonts.SemiBold,
  },
  loaderContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.Text2,
    textAlign: 'center',
    fontFamily: fonts.Regular,
  },
  addButton: {
    marginTop: 15,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: colors.Primary,
    borderRadius: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    fontFamily: fonts.Medium,
  },
});
