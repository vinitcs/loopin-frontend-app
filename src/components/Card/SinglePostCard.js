import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  LayoutAnimation,
  UIManager,
  Platform,
  ScrollView,
  Dimensions,
} from 'react-native';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Heart,
  MessageCircle,
  Share2,
  UserStar,
} from 'lucide-react-native';
import {Icon} from '@rneui/themed';
// import {useNavigation} from '@react-navigation/native';
// import {useSelector} from 'react-redux';
// import EncryptedStorage from 'react-native-encrypted-storage';
// import axios from 'axios';
// import {BACKEND_SERVER_URL} from '@env';
import {ActivityIndicator} from 'react-native-paper';
import Video from 'react-native-video';
import {colors} from '../../theme/colors/colors';
import {fonts} from '../../theme/fonts/fonts';
import {getTimeAgo} from '../../utils/DateTime/getTimeAgo';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import api from '../../api/apiInstance';

const {width} = Dimensions.get('window');

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ✅ Reusable Custom Video Player
const VideoPlayer = ({uri, isPlaying, onTogglePlay, muted, onToggleMute}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onTogglePlay}
      style={styles.videoWrapper}>
      <Video
        source={{uri}}
        style={styles.video}
        resizeMode="cover"
        paused={!isPlaying}
        repeat
        muted={muted}
      />

      {/* Play/Pause and Mute buttons */}
      <View style={styles.bottomLeftControls}>
        <TouchableOpacity onPress={onTogglePlay} style={styles.iconButton}>
          {isPlaying ? (
            <Pause color="#fff" size={18} />
          ) : (
            <Play color="#fff" size={18} />
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={onToggleMute} style={styles.iconButton}>
          {muted ? (
            <VolumeX color="#fff" size={18} />
          ) : (
            <Volume2 color="#fff" size={18} />
          )}
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

export const SinglePostCard = React.memo(
  ({
    userInfo, // comes as object with _id, name, avatar
    postId,
    postMedia = [],
    postDescription,
    isLiked,
    postLikeCount,
    postCommentCount,
    postDate,
    isLoggedUserCreated,
    showFollowBtn = true,
    isLoggedUserFollow,
    hashTags,
    mentionedUsersCount,
    isFocused,
    bottomSheetRef,
  }) => {
    // console.log('single post card render');

    // console.log('post card data:::', );

    const isScreenFocused = useIsFocused();
    // const navigation = useNavigation();
    // const {userRole} = useSelector(state => state.auth);

    // const [errorStates, setErrorStates] = useState(
    //   Array(postMedia.length).fill(false),
    // );

    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [muted, setMuted] = useState(true); // default mute
    const [descriptionExpand, setDescriptionExpand] = useState(false);
    const [isPostLiked, setIsPostLiked] = useState(isLiked);
    const [likeCount, setLikeCount] = useState(postLikeCount);
    const [commentCount, setCommentCount] = useState(postCommentCount);
    const [userFollowStatus, setUserFollowStatus] =
      useState(isLoggedUserFollow);
    const imageLoadingRef = useRef({}); // track loading without re-render
    const navigation = useNavigation();

    // const handleOpenPost = async () => {
    //   const role = await EncryptedStorage.getItem('Role');
    //   console.log('role', role, postId);
    //   navigation.navigate('PostDetails', {postId});
    // };

    // const deletePost = async () => {
    //   Alert.alert(
    //     'Delete Confirmation',
    //     'Are you sure you want to delete this post?',
    //     [
    //       {text: 'Cancel', style: 'cancel'},
    //       {
    //         text: 'Delete',
    //         style: 'destructive',
    //         onPress: async () => {
    //           try {
    //             const Authorization = await EncryptedStorage.getItem(
    //               'Authorization',
    //             );
    //             const res = await axios.delete(
    //               `${BACKEND_SERVER_URL}/api/v1/admin/post/delete`,
    //               {
    //                 headers: {Authorization: `Bearer ${Authorization}`},
    //                 data: {postId},
    //               },
    //             );

    //             if (res.data.success) {
    //               Alert.alert('Post Deleted Successfully!');
    //               fetchContent();
    //             }
    //           } catch (error) {
    //             console.log(error.response?.data || error.message);
    //             Alert.alert('Error deleting post!');
    //           }
    //         },
    //       },
    //     ],
    //   );
    // };

    const toggleDescription = () => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setDescriptionExpand(prev => !prev);
    };

    const handleScroll = event => {
      const scrollX = event.nativeEvent.contentOffset.x;
      const index = Math.round(scrollX / width);
      setCurrentMediaIndex(index);
    };

    // VIDEO CONTROL HANDLERS
    const togglePlay = () => {
      setIsPlaying(prev => !prev);
    };

    const handleToggleMute = () => {
      setMuted(prev => !prev);
    };

    const openCommentSheet = () => {
      bottomSheetRef.current?.openSheet(
        'comment',
        {
          contentType: 'post',
          contentId: postId,
          onCommentCountChange: setCommentCount,
        },
        ['100%'],
      );
    };

    const openMentionUserSheet = () => {
      const sheetSnapPoint =
        mentionedUsersCount <= 3
          ? '25%'
          : mentionedUsersCount <= 6
          ? '50%'
          : '100%';

      bottomSheetRef.current?.openSheet(
        'mention-user',
        {
          postId,
        },
        [sheetSnapPoint],
      );
    };

    const handleLike = async postId => {
      const previousLikeState = isPostLiked;
      const previousCount = likeCount;

      try {
        const res = await api.post('/api/v1/action/like', {
          contentType: 'post',
          contentId: postId,
        });

        // console.log('like unlike:::', res.data);

        setIsPostLiked(res.data.isLiked);
        setLikeCount(res.data.isLiked ? previousCount + 1 : previousCount - 1);

        if (res.data.success) {
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
        setIsPostLiked(previousLikeState);
        setLikeCount(previousCount);

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
      }
    };

    const handleUserFollow = async userId => {
      try {
        const res = await api.post('/api/v1/user/follow-unfollow', {
          targetUserId: userId,
        });

        // console.log('Follow unFollow:::', res.data);

        if (res.data.success) {
          setUserFollowStatus(res.data.isLoggedUserFollow);
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
      }
    };

    useEffect(() => {
      setIsPostLiked(isLiked);
      setLikeCount(postLikeCount);
    }, [isLiked, postLikeCount]);

    useEffect(() => {
      const currentMedia = postMedia[currentMediaIndex];

      if (currentMedia?.type === 'video') {
        const shouldPlay = isScreenFocused && isFocused;
        setIsPlaying(shouldPlay);
        setMuted(!shouldPlay);
      }
    }, [isScreenFocused, isFocused, currentMediaIndex, postMedia]);

    return (
      <View
        style={styles.cardContainer}
        //   onPress={handleOpenPost}
      >
        {/* User Info */}
        <View style={styles.userInfoWrapper}>
          <TouchableOpacity
            style={styles.sectionPair}
            disabled={isLoggedUserCreated}
            onPress={() => {
              navigation.navigate('VisitProfile', {targetUserId: userInfo._id});
            }}>
            <Image
              source={
                userInfo.avatar
                  ? {uri: userInfo.avatar}
                  : require('../../assets/blank-profile-pic.png')
              }
              style={styles.avatar}
            />

            <View>
              <Text style={styles.username}>{userInfo?.name || ''}</Text>
              <Text style={styles.userNameTag}>{userInfo?.nameTag || ''}</Text>
            </View>
          </TouchableOpacity>
          
          {showFollowBtn && !isLoggedUserCreated && (
            <View style={styles.sectionPair}>
              <TouchableOpacity
                onPress={() => handleUserFollow(userInfo._id)}
                style={[
                  styles.followBtn,
                  userFollowStatus
                    ? {backgroundColor: colors.Outline}
                    : {backgroundColor: colors.Primary},
                ]}>
                <Text
                  style={[
                    styles.followBtnLabel,
                    userFollowStatus
                      ? {color: colors.Text1}
                      : {color: colors.Text3},
                  ]}>
                  {userFollowStatus ? 'Following' : 'Follow'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* postMedia Section */}
        {postMedia && postMedia.length > 0 ? (
          <View>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              style={styles.mediaScroll}
              onScroll={handleScroll}
              scrollEventThrottle={16}>
              {postMedia.map((item, index) => (
                <View key={item._id || index} style={styles.mediaContainer}>
                  {/* Image */}
                  {item.type === 'image' && (
                    <>
                      <Image
                        source={{
                          uri: `${item.url.replace(
                            '/upload/',
                            '/upload/f_auto,q_auto,w_auto/',
                          )}`,
                        }}
                        style={styles.postImage}
                        resizeMode="cover"
                        onLoadStart={() =>
                          (imageLoadingRef.current[index] = true)
                        }
                        onLoadEnd={() =>
                          (imageLoadingRef.current[index] = false)
                        }
                      />
                      {imageLoadingRef.current[index] && (
                        <View style={styles.loadingOverlay}>
                          <ActivityIndicator size="small" color="#1e90ff" />
                        </View>
                      )}
                    </>
                  )}

                  {/* Video  */}
                  {item.type === 'video' && (
                    <VideoPlayer
                      uri={`${item.url.replace(
                        '/upload/',
                        '/upload/f_auto,q_auto,w_auto/',
                      )}`}
                      isPlaying={isPlaying && index === currentMediaIndex}
                      muted={muted}
                      onTogglePlay={() => togglePlay(index)}
                      onToggleMute={handleToggleMute}
                    />
                  )}
                </View>
              ))}
            </ScrollView>

            {/* ✅ Media counter top-right */}
            {postMedia.length > 1 && (
              <View style={styles.mediaCounter}>
                <Text style={styles.mediaCounterText}>
                  {currentMediaIndex + 1}/{postMedia.length}
                </Text>
              </View>
            )}
          </View>
        ) : (
          <View style={[styles.postImage, styles.noImageContainer]}>
            <Text style={styles.noImageText}>No media available</Text>
          </View>
        )}

        {/* Actions */}

        <View style={styles.actionSection}>
          <View style={styles.actionFeatureGroup}>
            <View style={styles.actionFeaturePair}>
              <TouchableOpacity
                style={styles.actionFeatureIcon}
                onPress={() => handleLike(postId)}>
                <Heart
                  size={24}
                  color={isPostLiked ? colors.Highlight3 : colors.Text1}
                  fill={isPostLiked ? colors.Highlight3 : 'none'}
                />
              </TouchableOpacity>
              <Text style={styles.actionFeatureText}>{likeCount}</Text>
            </View>

            <View style={styles.actionFeaturePair}>
              <TouchableOpacity
                style={styles.actionFeatureIcon}
                onPress={openCommentSheet}>
                <MessageCircle size={24} />
              </TouchableOpacity>
              <Text style={styles.actionFeatureText}>{commentCount}</Text>
            </View>

            {mentionedUsersCount > 0 && (
              <View style={styles.actionFeaturePair}>
                <TouchableOpacity
                  style={styles.actionFeatureIcon}
                  onPress={openMentionUserSheet}>
                  <UserStar size={22} />
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.actionFeaturePair}>
              <TouchableOpacity style={styles.actionFeatureIcon}>
                <Share2 size={22} />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.actionFeatureIcon}>
            <Icon name="bookmark-outline" type="ionicon" size={24} />
          </TouchableOpacity>
        </View>

        {/* Description */}
        {postDescription && (
          <View style={styles.descriptionSection}>
            <Text
              style={styles.description}
              numberOfLines={descriptionExpand ? undefined : 2}>
              {postDescription}
            </Text>

            {postDescription?.length > 250 && (
              <TouchableOpacity
                style={styles.descriptionExpandbtn}
                onPress={toggleDescription}>
                <Text style={styles.descriptionExpandLabel}>
                  {descriptionExpand ? 'Read Less' : 'Read More'}
                </Text>
              </TouchableOpacity>
            )}

            <View style={styles.hashTagSection}>
              {hashTags.map((hashTag, index) => (
                <TouchableOpacity key={index}>
                  <Text style={styles.hashTagText}>{hashTag}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <Text style={styles.postDate}>{getTimeAgo(postDate)}</Text>
      </View>
    );
  },

  // ✅ Prevent unnecessary re-renders
  (prevProps, nextProps) => {
    // Return TRUE if props are equal (don't re-render)
    // Return FALSE if props changed (re-render needed)

    if (prevProps.postId !== nextProps.postId) return false;
    if (prevProps.isLiked !== nextProps.isLiked) return false;
    if (prevProps.postLikeCount !== nextProps.postLikeCount) return false;
    if (prevProps.postCommentCount !== nextProps.postCommentCount) return false;

    // ✅ Only trigger re-render for focus change if current media is video
    if (prevProps.isFocused !== nextProps.isFocused) {
      const hasVideo = nextProps.postMedia?.some(
        media => media.type === 'video',
      );

      if (hasVideo) {
        return false; // re-render for video
      } else {
        return true; // don't re-render for images
      }
    }

    return true; // props are equal, don't re-render
  },
);

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: colors.Background1,
    paddingVertical: 15,
  },
  userInfoWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginBottom: 10,
    justifyContent: 'space-between',
  },
  sectionPair: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  username: {
    fontSize: 14,
    fontFamily: fonts.Bold,
    color: colors.Text1,
    textTransform: 'capitalize',
  },
  userNameTag: {
    fontSize: 12,
    fontFamily: fonts.SemiBold,
    color: colors.Text2,
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
  postDate: {
    fontSize: 12,
    color: 'gray',
    marginLeft: 15,
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
  mediaScroll: {
    marginBottom: 10,
  },
  mediaContainer: {
    width: width,
    height: 380,
  },
  postImage: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.Background1,
  },
  videoWrapper: {
    width: width,
    height: 380,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.Background2,
    overflow: 'hidden',
    position: 'relative',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  bottomLeftControls: {
    position: 'absolute',
    bottom: 15,
    right: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconButton: {
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 50,
  },
  mediaCounter: {
    position: 'absolute',
    top: 10,
    right: 15,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  mediaCounterText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: fonts.SemiBold,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(245,245,245,0.8)',
  },
  errorContainer: {
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderStyle: 'dashed',
  },
  errorText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
  },
  noImageContainer: {
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  noImageText: {
    color: '#6c757d',
    fontSize: 14,
    textAlign: 'center',
  },
  actionSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    // marginTop: 6,
  },
  actionFeatureGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionFeaturePair: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 14,
  },
  actionFeatureIcon: {
    padding: 4,
  },
  actionFeatureText: {
    marginLeft: 4,
    fontSize: 13,
    color: colors.Text2,
  },
  descriptionSection: {
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: '#444',
  },
  descriptionExpandbtn: {
    alignSelf: 'flex-start',
    paddingTop: 2,
  },
  descriptionExpandLabel: {
    // backgroundColor: 'orange',
    paddingRight: 6,
    fontSize: 10,
    color: colors.Text2,
    fontFamily: fonts.SemiBold,
  },

  hashTagSection: {
    marginTop: 10,
  },
  hashTagText: {
    fontSize: 12,
    fontFamily: fonts.Bold,
    color: colors.Primary,
  },
});
