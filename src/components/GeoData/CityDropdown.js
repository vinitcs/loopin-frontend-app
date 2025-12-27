import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import api from '../../api/apiInstance';
import {colors} from '../../theme/colors/colors';
import {fonts} from '../../theme/fonts/fonts';
import {BottomSheetFlatList} from '@gorhom/bottom-sheet';
import UserInput from '../Credentials/UserInput';
import Toast from 'react-native-toast-message';
import EncryptedStorage from 'react-native-encrypted-storage';

const CityDropdown = ({
  selectedCity,
  onSelectCity,
  placeholder = 'Select City',
  countryIso2 = 'IN',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [cities, setCities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const limit = 20;

  const [debounceTimer, setDebounceTimer] = useState(null);

  const fetchCities = async (page = 1, search = '') => {
    if (isLoading) return;

    try {
      setIsLoading(true);

      const res = await api.get(
        `/api/v1/public/cities?countryIso2=${countryIso2}&city=${search}&page=${page}&limit=${limit}`,
      );

      if (res.data.success) {
        const citiesList = res.data.cities || [];

        if (page === 1) {
          setCities(citiesList);
        } else {
          setCities(prev => [...prev, ...citiesList]);
        }

        setHasMore(citiesList.length === limit);
        setCurrentPage(page);
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
          text1: error.errorMessage || 'Failed to fetch cities.',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Load initial cities
  useEffect(() => {
    fetchCities(1, '');
  }, []);

  // Debounced search
  useEffect(() => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    const timer = setTimeout(() => {
      fetchCities(1, searchQuery);
    }, 500);

    setDebounceTimer(timer);

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [searchQuery]);

  const handleSelectCity = cityName => {
    onSelectCity(cityName);
  };

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      fetchCities(currentPage + 1, searchQuery);
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

  const getStateName = stateIso2 => {
    const stateMap = {
      MH: 'Maharashtra',
      UP: 'Uttar Pradesh',
      CT: 'Chhattisgarh',
      OR: 'Odisha',
      WB: 'West Bengal',
      TN: 'Tamil Nadu',
      DL: 'Delhi',
      KA: 'Karnataka',
      TG: 'Telangana',
      GJ: 'Gujarat',
      RJ: 'Rajasthan',
      MP: 'Madhya Pradesh',
      BR: 'Bihar',
      AP: 'Andhra Pradesh',
      HR: 'Haryana',
      PB: 'Punjab',
      JH: 'Jharkhand',
      AS: 'Assam',
      KL: 'Kerala',
      UT: 'Uttarakhand',
      HP: 'Himachal Pradesh',
      CH: 'Chandigarh',
    };
    return stateMap[stateIso2] || stateIso2;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Text style={styles.title}>Select Event City</Text>

      {/* Search Input */}
      <UserInput
        placeholder={'Search city...'}
        leftIcon={'leftIcon'}
        leftIconName={'search-outline'}
        onChangeState={setSearchQuery}
      />

      {/* City List */}
      {isLoading && currentPage === 1 ? (
        <View style={styles.centerLoader}>
          <ActivityIndicator size="large" color={colors.Primary} />
          <Text style={styles.loadingText}>Loading cities...</Text>
        </View>
      ) : (
        <BottomSheetFlatList
          data={cities}
          keyExtractor={(item, index) =>
            `${item.name}-${item.stateIso2}-${index}`
          }
          renderItem={({item}) => (
            <TouchableOpacity
              style={[
                styles.cityItem,
                selectedCity === item.name && styles.selectedCityItem,
              ]}
              onPress={() => handleSelectCity(item.name)}>
              <View style={styles.cityInfo}>
                <Text style={styles.cityName}>{item.name}</Text>
                <Text style={styles.stateName}>
                  {getStateName(item.stateIso2)}
                </Text>
              </View>
              {selectedCity === item.name && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </TouchableOpacity>
          )}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {searchQuery
                  ? 'No cities found'
                  : 'Start typing to search cities'}
              </Text>
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

export default CityDropdown;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
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
  cityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.Outline,
  },
  selectedCityItem: {
    backgroundColor: colors.Background3,
  },
  cityInfo: {
    flex: 1,
  },
  cityName: {
    fontSize: 16,
    fontFamily: fonts.SemiBold,
    color: colors.Text1,
    marginBottom: 4,
  },
  stateName: {
    fontSize: 14,
    color: colors.Text2,
    fontFamily: fonts.Regular,
  },
  checkmark: {
    fontSize: 20,
    color: colors.Primary,
    fontWeight: 'bold',
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
});
