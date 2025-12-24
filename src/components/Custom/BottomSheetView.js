import {StyleSheet, View, BackHandler} from 'react-native';
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  useImperativeHandle,
} from 'react';
import BottomSheet, {BottomSheetBackdrop} from '@gorhom/bottom-sheet';
import {colors} from '../../theme/colors/colors';
import {useNavigation} from '@react-navigation/native';
import CityDropdown from '../../components/GeoData/CityDropdown';
import Button from '../Button/Button';
import SearchUser from '../../components/Search/SearchUser';
import SearchHashtag from '../../components/Search/SearchHashtag';
import DisplayUserList from '../../components/DisplayList/DisplayUserList';
import Comments from '../../components/DisplayList/Comments';

const BottomSheetView = forwardRef((props, ref) => {
  const navigation = useNavigation();
  const bottomSheetRef = useRef(null);
  const [sheetIndex, setSheetIndex] = useState(-1); // track current sheet index
  const [mode, setMode] = useState(null); // create, comment
  const [sheetData, setSheetData] = useState(null); // Store data passed to sheet
  const [dynamicSnapPoints, setDynamicSnapPoints] = useState(['50%']);

  useImperativeHandle(ref, () => ({
    openSheet: (newMode = 'create', data = null, snap = ['50%']) => {
      setMode(newMode);
      setSheetData(data);
      setDynamicSnapPoints(snap);
      bottomSheetRef.current?.snapToIndex(0);
    },
    closeSheet: () => {
      bottomSheetRef.current?.close();
    },
    updateSheetData: data => {
      setSheetData(prev => ({...prev, ...data}));
    },
  }));

  // Update sheet index when it opens/closes
  const handleSheetChange = useCallback(
    index => {
      setSheetIndex(index);

      const parent = navigation.getParent();
      if (parent) {
        parent.setOptions({
          tabBarStyle:
            index >= 0
              ? {display: 'none'}
              : {
                  height: 80,
                  paddingBottom: 20,
                  paddingTop: 10,
                },
        });
      }

      if (index === -1) {
        setMode(null);
        setSheetData(null);
      }
    },
    [navigation],
  );

  // handle Android back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        // if bottom sheet is open, close it first
        if (sheetIndex >= 0) {
          bottomSheetRef.current?.close();
          return true; // prevent default back action
        }
        return false; // otherwise exit app or go back
      },
    );

    return () => backHandler.remove();
  }, [sheetIndex]);

  // Custom Backdrop (to allow outside touch to close)
  const renderBackdrop = useCallback(
    props => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        pressBehavior="close" // tapping outside closes sheet
      />
    ),
    [],
  );

  const handleUserSelected = user => {
    if (sheetData?.onSelectUser) {
      sheetData.onSelectUser(user);
    }
    // bottomSheetRef.current?.close();
  };

  const handleCitySelected = cityName => {
    if (sheetData?.onSelectCity) {
      sheetData.onSelectCity(cityName); // Call the callback
    }
    // bottomSheetRef.current?.close();
  };

  const handleHashtagSelected = hashtag => {
    if (sheetData?.onSelectHashtag) {
      sheetData.onSelectHashtag(hashtag);
    }
    // bottomSheetRef.current?.close();
  };

  return (
    /* Bottom Sheet for Create Post */

    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={dynamicSnapPoints}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={styles.sheetIndicator}
      backgroundStyle={styles.sheetBackground}
      onChange={handleSheetChange}>
      <View style={styles.sheetContainer}>
        {mode === 'media' && (
          <>
            <Button
              Title={'Open Camera'}
              BackgroundColor={'Background3'}
              TextColor={'Text2'}
              onPressChanges={() => {
                sheetData?.onCameraPress?.();
                bottomSheetRef.current?.close();
              }}
            />
            <Button
              Title={'Open Gallery'}
              BackgroundColor={'Background3'}
              TextColor={'Text2'}
              onPressChanges={() => {
                sheetData?.onGalleryPress?.();
                bottomSheetRef.current?.close();
              }}
            />
          </>
        )}
        {mode === 'comment' && (
          <Comments
            contentType={sheetData?.contentType}
            contentId={sheetData?.contentId}
            onCommentCountChange={sheetData?.onCommentCountChange}
          />
        )}
        {mode === 'mention-user' && (
          <DisplayUserList postId={sheetData?.postId} />
        )}
        {mode === 'search-user' && (
          <SearchUser
            selectedUser={sheetData?.selectedUser || []}
            onSelectUser={handleUserSelected}
            placeholder="Search by user name or user tag"
            bottomSheetRef={bottomSheetRef}
          />
        )}
        {mode === 'event-city' && (
          <CityDropdown
            selectedCity={sheetData?.selectedCity || ''}
            onSelectCity={handleCitySelected}
            placeholder="Select event city"
            countryIso2="IN"
            bottomSheetRef={bottomSheetRef}
          />
        )}
        {mode === 'search-hashtag' && (
          <SearchHashtag
            selectedHashtag={sheetData?.selectedHashtag || []}
            onSelectHashtag={handleHashtagSelected}
            placeholder="Select hash tag"
            bottomSheetRef={bottomSheetRef}
          />
        )}
      </View>
    </BottomSheet>
  );
});

export default BottomSheetView;

const styles = StyleSheet.create({
  sheetContainer: {
    // backgroundColor: 'pink',
    flex: 1,
    alignItems: 'center',
    paddingTop: 25,
    paddingHorizontal: 15,
    gap: 16,
  },
  sheetBackground: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  sheetIndicator: {
    backgroundColor: colors.Primary,
    width: 30,
  },
  mediaOptionSection: {
    width: '100%',
    gap: 16,
  },
});
