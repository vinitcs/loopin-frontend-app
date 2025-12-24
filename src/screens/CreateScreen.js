import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  Dimensions,
  TouchableOpacity,
  Image,
  FlatList,
} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';
import {colors} from '../theme/colors/colors';
import {fonts} from '../theme/fonts/fonts';
import {Image as ImageIcon, X, FilePlay, FileImage} from 'lucide-react-native';
import Video from 'react-native-video';
import Header from '../components/Custom/Header';
// import DateTimePickerModal from 'react-native-modal-datetime-picker';
import UserInput from '../components/Credentials/UserInput';
import Button from '../components/Button/Button';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import api from '../api/apiInstance';
import {useMediaPicker} from '../utils/Media/useMediaPicker';
import Toast from 'react-native-toast-message';
import EncryptedStorage from 'react-native-encrypted-storage';

const {width: screenWidth, height: screenHeight} = Dimensions.get('window');

const CreateScreen = ({bottomSheetRef}) => {
  const navigation = useNavigation();
  const {pickFromCamera, pickFromGallery} = useMediaPicker();

  const [newPost, setNewPost] = useState({
    description: '',
    userTag: [], // store user _id
    hashTag: [],
    isEvent: false,
    eventDate: new Date(),
    eventCity: '',
  });

  const [mediaFiles, setMediaFiles] = useState([]);
  const hasMedia = mediaFiles.length > 0;

  // Separate state to store full user objects for display
  const [selectedUsers, setSelectedUsers] = useState([]);

  // Separate state to store full hashtag objects for display
  const [selectedHashtags, setSelectedHashtags] = useState([]);

  console.log('new post data::::', newPost);
  console.log('selected users for display::::', selectedUsers);
  console.log('selected hashtags for display::::', selectedHashtags);

  const [isCreatingPost, setIsCreatingPost] = useState(false);

  // const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  console.log('media files:::', mediaFiles);

  const createPost = async () => {
    try {
      setIsCreatingPost(true);

      let formData = new FormData();

      if (mediaFiles) {
        mediaFiles.forEach(file => {
          formData.append('media', {
            uri: file.uri,
            name: file.fileName || `upload_${Date.now()}.jpg`,
            type: file.type,
          });
        });
      }

      formData.append('description', newPost.description);

      formData.append('mentionedUsers', JSON.stringify(newPost.userTag));
      formData.append('hashTags', JSON.stringify(newPost.hashTag));

      console.log('formData:::', formData);

      const res = await api.post('/api/v1/post/add', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.data?.success) {
        Toast.show({
          type: 'success',
          text1: res.data.message,
        });
        navigation.navigate('Home');
      }
    } catch (error) {
      // console.log('create post error:::', error);

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
          text1: error?.response?.data?.message || 'Error while creating post',
        });
      }
    } finally {
      setIsCreatingPost(false);
    }
  };

  const handlePickFromCamera = async () => {
    const files = await pickFromCamera({type: 'mixed'});
    setMediaFiles(prev => [...prev, ...files]);
  };

  const handlePickFromGallery = async () => {
    const files = await pickFromGallery({type: 'mixed'});
    setMediaFiles(prev => [...prev, ...files]);
  };

  const openPickerSheet = () => {
    bottomSheetRef.current?.openSheet(
      'media',
      {
        onCameraPress: handlePickFromCamera,
        onGalleryPress: handlePickFromGallery,
      },
      ['30'],
    );
  };

  const removeMedia = uri => {
    setMediaFiles(prev => prev.filter(f => f.uri !== uri));
  };

  const handleTagUserSelection = () => {
    console.log('Opening sheet with users:', selectedUsers);
    bottomSheetRef.current?.openSheet(
      'search-user',
      {
        selectedUser: selectedUsers,
        onSelectUser: handleUserSelected,
      },
      ['100%'],
    );
  };

  const handleUserSelected = user => {
    console.log('selected user data create screen:::', user);

    if (!user || !user._id) {
      return;
    }

    setSelectedUsers(prevUsers => {
      const isAlreadySelected = prevUsers.some(u => u._id === user._id);
      const updatedUsers = isAlreadySelected
        ? prevUsers.filter(u => u._id !== user._id)
        : [...prevUsers, user];

      setNewPost(prev => ({
        ...prev,
        userTag: updatedUsers.map(u => u._id),
      }));

      return updatedUsers;
    });
  };

  //Handle removing a user from chips
  const handleRemoveUser = userId => {
    setSelectedUsers(prev => prev.filter(u => u._id !== userId));
    setNewPost(prev => ({
      ...prev,
      userTag: prev.userTag.filter(id => id !== userId),
    }));
  };

  const handleHashtagSelection = () => {
    console.log('Opening sheet with hashtags:', selectedHashtags);

    bottomSheetRef.current?.openSheet(
      'search-hashtag',
      {
        selectedHashtag: selectedHashtags,
        onSelectHashtag: handleHashtagSelected,
      },
      ['100%'],
    );
  };

  const handleHashtagSelected = hashtag => {
    console.log('selected hashtag data create screen:::', hashtag);

    const hashtagObj = hashtag._id
      ? hashtag
      : {
          _id: hashtag, // Use string as temp ID for matching
          original: hashtag,
        };

    if (!hashtagObj.original) {
      return;
    }

    setSelectedHashtags(prevHashtags => {
      const isAlreadySelected = prevHashtags.some(
        h => h.original === hashtagObj.original,
      );
      const updatedHashtags = isAlreadySelected
        ? prevHashtags.filter(h => h.original !== hashtagObj.original)
        : [...prevHashtags, hashtagObj];

      setNewPost(prev => ({
        ...prev,
        hashTag: updatedHashtags.map(h => h.original),
      }));

      return updatedHashtags;
    });
  };

  //Handle removing a hashtag from chips
  const handleRemoveHashtag = hashtagId => {
    setSelectedHashtags(prev => prev.filter(h => h._id !== hashtagId));
    setNewPost(prev => ({
      ...prev,
      hashTag: prev.hashTag.filter(tag => {
        const hashtagObj = selectedHashtags.find(h => h._id === hashtagId);
        return hashtagObj ? tag !== hashtagObj.original : true;
      }),
    }));
  };

  // const handleEventToggle = value => {
  //   setNewPost({
  //     ...newPost,
  //     isEvent: value,
  //     eventDate: value ? newPost.eventDate : new Date(),
  //     eventCity: value ? newPost.eventCity : '',
  //   });
  // };

  // const formatDate = date => {
  //   return date.toLocaleDateString('en-US', {
  //     year: 'numeric',
  //     month: 'long',
  //     day: 'numeric',
  //   });
  // };

  // const handleDateConfirm = date => {
  //   setNewPost({...newPost, eventDate: date});
  //   setDatePickerVisibility(false);
  // };

  // const handleEventDateSelection = () => {
  //   setDatePickerVisibility(true);
  // };

  // const handleEventCitySelection = () => {
  //   bottomSheetRef.current?.openSheet(
  //     'event-city',
  //     {
  //       selectedCity: newPost.eventCity,
  //       onSelectCity: cityName => {
  //         setNewPost({...newPost, eventCity: cityName});
  //       },
  //     },
  //     ['100%'],
  //   );
  // };

  useEffect(() => {
    bottomSheetRef.current.updateSheetData({
      selectedUser: selectedUsers,
    });
  }, [selectedUsers]);

  useEffect(() => {
    bottomSheetRef.current.updateSheetData({
      selectedHashtag: selectedHashtags,
    });
  }, [selectedHashtags]);

  useFocusEffect(
    useCallback(() => {
      return () => {
        setMediaFiles([]);
        setSelectedUsers([]);
        setSelectedHashtags([]);
        setNewPost({
          description: '',
          userTag: [],
          hashTag: [],
          isEvent: false,
          eventDate: new Date(),
          eventCity: '',
        });
      };
    }, []),
  );

  const renderMediaItem = ({item: file}) => (
    <View style={styles.mediaItem}>
      {file.type?.startsWith('image/') ? (
        <View>
          <Image source={{uri: file.uri}} style={styles.mediaThumbnail} />
          <FileImage
            size={16}
            color={colors.Background1}
            style={styles.mediaThumbnailFileIcon}
          />
        </View>
      ) : (
        <View style={styles.videoWrapper}>
          <Video
            source={{uri: file.uri}}
            style={styles.mediaThumbnail}
            resizeMode="cover"
            paused
          />
          <FilePlay
            size={16}
            color={colors.Background1}
            style={styles.mediaThumbnailFileIcon}
          />
        </View>
      )}
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => removeMedia(file.uri)}>
        <X size={16} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  return (
    <>
      <View style={styles.container}>
        <Header showAppLogo={true} />
        <ScrollView
          contentContainerStyle={styles.scrollView}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          <View style={styles.contentWrapper}>
            <View style={styles.mainSection}>
              <Text style={styles.sectionTitle}>Create Post</Text>

              {/* Media Picker */}
              <Button
                Title="Pick Media"
                BackgroundColor={'Background3'}
                TextColor={'Text2'}
                onPressChanges={openPickerSheet}
              />

              {/* Media Preview Section */}
              {mediaFiles.length > 0 && (
                <View style={styles.mediaWrapper}>
                  <FlatList
                    data={mediaFiles}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={item => item.uri}
                    renderItem={renderMediaItem}
                    contentContainerStyle={styles.previewContainer}
                  />
                </View>
              )}

              {/* <Text style={styles.label}>Description</Text> */}
              <TextInput
                style={styles.textArea}
                value={newPost.description}
                multiline
                numberOfLines={6}
                placeholder="Add some vibes to your post…"
                onChangeText={text =>
                  setNewPost({...newPost, description: text})
                }
                //   editable={!isCreatingPost}
              />

              {/* Tag people */}
              <UserInput
                leftIcon={true}
                leftIconName={'people-outline'}
                leftIconColor={colors.Primary}
                placeholder={'Tag people'}
                readOnly={true}
                rightIcon={true}
                rightIconName={'add-outline'}
                showChips={true}
                chipType={'user'}
                chips={selectedUsers}
                onChangeState={handleTagUserSelection}
                onRemoveChip={handleRemoveUser}
              />

              {/* Add hashtags */}
              <UserInput
                leftIcon={true}
                leftIconName={'pricetag-outline'}
                leftIconColor={colors.Primary}
                placeholder={'Add hashtags'}
                readOnly={true}
                rightIcon={true}
                rightIconName={'add-outline'}
                showChips={true}
                chipType={'hashtag'}
                chips={selectedHashtags}
                onChangeState={handleHashtagSelection}
                onRemoveChip={handleRemoveHashtag}
              />

              {/* <View style={styles.switchContainer}>
                <Text style={styles.switchLabel}>Post as an event</Text>
                <Switch
                  value={newPost.isEvent}
                  onValueChange={handleEventToggle}
                  trackColor={{false: colors.Outline, true: colors.Outline}}
                  thumbColor={
                    newPost.isEvent ? colors.Primary : colors.Background1
                  }
                />
              </View> */}

              {/* {newPost.isEvent && (
                <View style={styles.eventInputSection}>
                  <View style={styles.eventInputPair}>
                    <Text style={styles.label}>
                      Event Date <Text style={{color: 'red'}}>*</Text>
                    </Text>

                    <UserInput
                      leftIcon={true}
                      leftIconColor={colors.Primary}
                      leftIconName={'calendar-outline'}
                      readOnly={true}
                      rightIcon={true}
                      rightIconName={'add-outline'}
                      onChangeState={handleEventDateSelection}
                      value={formatDate(newPost.eventDate)}
                    />
                  </View>

                  <View>
                    <Text style={styles.label}>
                      Event City <Text style={{color: 'red'}}>*</Text>
                    </Text>

                    <UserInput
                      placeholder={'Select event city'}
                      leftIcon={true}
                      leftIconColor={colors.Primary}
                      leftIconName={'location-outline'}
                      readOnly={true}
                      rightIcon={true}
                      rightIconName={'chevron-down-circle-outline'}
                      onChangeState={handleEventCitySelection}
                      value={newPost.eventCity}
                    />
                  </View>
                </View>
              )} */}

              {hasMedia && (
                <Button
                  Title={isCreatingPost ? 'Posting...' : 'Create Post'}
                  BackgroundColor={'Primary'}
                  TextColor={'Text3'}
                  onPressChanges={createPost}
                  disabled={isCreatingPost}
                />
              )}
            </View>
          </View>
        </ScrollView>
      </View>

      {/* <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleDateConfirm}
        onCancel={() => setDatePickerVisibility(false)}
        minimumDate={new Date()}
      /> */}
    </>
  );
};

export default CreateScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.Background1,
  },

  scrollView: {
    flexGrow: 1,
  },

  contentWrapper: {
    flex: 1,
    minHeight: screenHeight - 100,
    paddingBottom: 10,
  },
  mainSection: {
    backgroundColor: colors.Background1,
    paddingHorizontal: 15,
    gap: 18,
  },

  sectionTitle: {
    fontSize: 16,
    fontFamily: fonts.SemiBold,
    marginBottom: 20,
    color: colors.Text2,
    textAlign: 'center',
  },

  label: {
    fontSize: 14,
    fontFamily: fonts.SemiBold,
    marginBottom: 8,
    color: colors.Text2,
  },
  textArea: {
    padding: 12,
    borderWidth: 0.5,
    borderColor: colors.Outline,
    borderRadius: 12,
    textAlignVertical: 'top',
    fontSize: 16,
    fontFamily: fonts.Regular,
    backgroundColor: colors.Background1,
  },
  mediaWrapper: {
    height: 140,
    // marginBottom: 15,
  },
  previewContainer: {
    paddingRight: 10,
  },
  mediaItem: {
    position: 'relative',
    marginRight: 10,
  },
  mediaThumbnail: {
    width: screenWidth / 3,
    height: 120,
    borderRadius: 10,
  },
  videoWrapper: {
    width: screenWidth / 3,
    height: 120,
    borderRadius: 10,
    overflow: 'hidden',
  },
  mediaThumbnailFileIcon: {
    position: 'absolute',
    bottom: 4,
    left: 4,
  },
  removeButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    padding: 3,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: colors.Background3,
    borderRadius: 8,
  },
  switchLabel: {
    fontSize: 14,
    fontFamily: fonts.SemiBold,
    color: colors.Text2,
  },
  eventInputSection: {
    marginBottom: 20,
  },
  eventInputPair: {
    marginBottom: 15,
  },
});
