import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Keyboard,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {fonts} from '../../theme/fonts/fonts';
import {colors} from '../../theme/colors/colors';
import Toast from 'react-native-toast-message';
import api from '../../api/apiInstance';
import {BottomSheetFlatList} from '@gorhom/bottom-sheet';
import {getTimeAgo} from '../../utils/DateTime/getTimeAgo';
import {Heart, ChevronDown, ChevronUp, Send, X} from 'lucide-react-native';

const Comments = ({contentType, contentId}) => {
  const [parentComments, setParentComments] = useState([]);
  const [expandedComments, setExpandedComments] = useState({});
  const [replyComments, setReplyComments] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [loadingReplies, setLoadingReplies] = useState({});

  // Comment input states
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);

  // Separate pagination states for parent comments
  const [parentCurrentPage, setParentCurrentPage] = useState(1);
  const [parentHasMore, setParentHasMore] = useState(true);

  // Separate pagination states for each reply thread
  const [replyPages, setReplyPages] = useState({});
  const [replyHasMore, setReplyHasMore] = useState({});

  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const limit = 20;

  const fetchParentComments = async (page = 1) => {
    if (isLoading) return;

    try {
      setIsLoading(true);
      const res = await api.get(
        `/api/v1/action/comment/parent/${contentType}/${contentId}?page=${page}&limit=${limit}`,
      );

      if (res.data.success) {
        const commentsList = res.data.comments || [];

        if (page === 1) {
          setParentComments(commentsList);
        } else {
          setParentComments(prev => [...prev, ...commentsList]);
        }

        setParentHasMore(commentsList.length === limit);
        setParentCurrentPage(page);
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
    } finally {
      setIsLoading(false);
    }
  };

  const fetchReplyComments = async (parentCommentId, page = 1) => {
    if (loadingReplies[parentCommentId]) return;

    try {
      setLoadingReplies(prev => ({...prev, [parentCommentId]: true}));
      const res = await api.get(
        `/api/v1/action/comment/reply/${parentCommentId}?page=${page}&limit=${limit}`,
      );

      if (res.data.success) {
        const commentsList = res.data.comments || [];

        if (page === 1) {
          setReplyComments(prev => ({
            ...prev,
            [parentCommentId]: commentsList,
          }));
        } else {
          setReplyComments(prev => ({
            ...prev,
            [parentCommentId]: [...(prev[parentCommentId] || []), commentsList],
          }));
        }

        setReplyHasMore(prev => ({
          ...prev,
          [parentCommentId]: commentsList.length === limit,
        }));
        setReplyPages(prev => ({
          ...prev,
          [parentCommentId]: page,
        }));
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
    } finally {
      setLoadingReplies(prev => ({...prev, [parentCommentId]: false}));
    }
  };

  const addComment = async () => {
    if (!commentText.trim()) {
      return Toast.show({
        type: 'error',
        text1: 'Please enter a comment',
      });
    }

    try {
      setIsSubmitting(true);

      const payload = {
        contentType,
        contentId,
        comment: commentText.trim(),
      };

      // Add parentCommentId if replying
      if (replyingTo) {
        payload.parentCommentId = replyingTo.commentId;
      }

      const res = await api.post('/api/v1/action/comment/add', payload);

      if (res.data.success) {
        Toast.show({
          type: 'success',
          text1: res.data.message || 'Comment added',
        });

        // Clear Input
        setCommentText('');
        Keyboard.dismiss();

        // Refresh comments based on type
        if (replyingTo) {
          // Refresh reply comments for this parent
          await fetchReplyComments(replyingTo.commentId, 1);

          // Update parent comment reply count
          setParentComments(prev =>
            prev.map(comment =>
              comment._id === replyingTo.commentId
                ? {
                    ...comment,
                    replyCommentCount: (comment.replyCommentCount || 0) + 1,
                  }
                : comment,
            ),
          );

          // Ensure replies are expanded
          setExpandedComments(prev => ({
            ...prev,
            [replyingTo.commentId]: true,
          }));

          // Clear reply state
          setReplyingTo(null);
        } else {
          // Refresh parent comments
          await fetchParentComments(1);
        }
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
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = (commentId, userName) => {
    setReplyingTo({commentId, userName});
    // You might want to focus the input here
  };

  const cancelReply = () => {
    setReplyingTo(null);
    setCommentText('');
  };

  useEffect(() => {
    fetchParentComments(1);
  }, [contentType, contentId]);

  const handleLoadMoreParents = () => {
    if (!isLoading && parentHasMore) {
      fetchParentComments(parentCurrentPage + 1);
    }
  };

  const handleLoadMoreReplies = parentCommentId => {
    const currentPage = replyPages[parentCommentId] || 1;
    const hasMore = replyHasMore[parentCommentId];

    if (!loadingReplies[parentCommentId] && hasMore) {
      fetchReplyComments(parentCommentId, currentPage + 1);
    }
  };

  const toggleReplies = async commentId => {
    const isExpanded = expandedComments[commentId];

    if (!isExpanded) {
      // Expand and fetch replies if not already fetched
      if (!replyComments[commentId]) {
        await fetchReplyComments(commentId, 1);
      }
      setExpandedComments(prev => ({...prev, [commentId]: true}));
    } else {
      // Collapse
      setExpandedComments(prev => ({...prev, [commentId]: false}));
    }
  };

  const handleLikeComment = async (
    commentId,
    isParent = true,
    parentCommentId = null,
  ) => {
    try {
      const res = await api.post('/api/v1/action/comment/like', {
        commentId: commentId,
      });

      if (res.data.success) {
        if (isParent) {
          setParentComments(prev =>
            prev.map(comment =>
              comment._id === commentId
                ? {
                    ...comment,
                    isLikedComment: res.data.isLikedComment,
                    commentLikeCount: res.data.isLikedComment
                      ? comment.commentLikeCount + 1
                      : comment.commentLikeCount - 1,
                  }
                : comment,
            ),
          );
        } else {
          // Update reply comment
          setReplyComments(prev => ({
            ...prev,
            [parentCommentId]: prev[parentCommentId]?.map(reply =>
              reply._id === commentId
                ? {
                    ...reply,
                    isLikedComment: res.data.isLikedComment,
                    commentLikeCount: res.data.isLikedComment
                      ? reply.commentLikeCount + 1
                      : reply.commentLikeCount - 1,
                  }
                : reply,
            ),
          }));
        }

        Toast.show({
          type: 'success',
          text1: res.data.message,
        });
      }
    } catch (error) {
      console.log(error.message);

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

  const renderReplyComment = ({item}) => {
    return (
      <View style={styles.replyCommentContainer}>
        <View style={styles.replyLine} />
        <View style={styles.replyContent}>
          <View style={styles.sectionGroup}>
            <Image
              source={
                item.userProfile?.avatar
                  ? {uri: item.userProfile.avatar}
                  : require('../../assets/blank-profile-pic.png')
              }
              style={styles.replyAvatar}
            />
            <View style={styles.commentSection}>
              <View style={styles.sectionPair}>
                <View>
                  <View style={styles.sectionPair}>
                    <Text style={styles.userName}>{item.userProfile.name}</Text>
                    <Text style={styles.commentTime}>
                      {getTimeAgo(item.createdAt)}
                    </Text>
                  </View>
                  <Text style={styles.userNameTag}>
                    {item.userProfile.nameTag}
                  </Text>
                </View>
              </View>
              <Text style={styles.commentText}>{item.comment}</Text>
            </View>
          </View>
          <View style={styles.actionSection}>
            <TouchableOpacity
              onPress={() =>
                handleLikeComment(item._id, false, item.parentCommentId)
              }
              style={styles.likeButton}>
              <Heart
                size={14}
                color={item.isLikedComment ? colors.Highlight3 : colors.Text2}
                fill={item.isLikedComment ? colors.Highlight3 : 'none'}
              />
              <Text style={styles.likeCount}>{item.commentLikeCount || 0}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const renderParentComment = ({item}) => {
    const isExpanded = expandedComments[item._id];
    const replies = replyComments[item._id] || [];
    const isLoadingReplies = loadingReplies[item._id];
    const hasMoreReplies = replyHasMore[item._id];
    const repliesShown = replies.length;

    return (
      <View style={styles.parentCommentWrapper}>
        <View style={styles.commentContainer}>
          <View style={styles.sectionGroup}>
            <Image
              source={
                item.userProfile?.avatar
                  ? {uri: item.userProfile.avatar}
                  : require('../../assets/blank-profile-pic.png')
              }
              style={styles.avatar}
            />
            <View style={styles.commentSection}>
              <View style={styles.sectionPair}>
                <View>
                  <View style={styles.sectionPair}>
                    <Text style={styles.userName}>{item.userProfile.name}</Text>
                    <Text style={styles.commentTime}>
                      {getTimeAgo(item.createdAt)}
                    </Text>
                  </View>
                  <Text style={styles.userNameTag}>
                    {item.userProfile.nameTag}
                  </Text>
                </View>
              </View>
              <Text style={styles.commentText}>{item.comment}</Text>

              {item.replyCommentCount > 0 && (
                <TouchableOpacity
                  style={styles.showReplyBtn}
                  onPress={() => toggleReplies(item._id)}>
                  <Text style={styles.showReplyBtnLabel}>
                    {isExpanded ? (
                      <>
                        <ChevronUp size={12} color={colors.Text2} />
                        {' Hide replies'}
                      </>
                    ) : (
                      <>
                        <ChevronDown size={12} color={colors.Text2} />
                        {' View '}
                        {item.replyCommentCount}{' '}
                        {item.replyCommentCount > 1 ? 'replies' : 'reply'}
                      </>
                    )}
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.replyBtn}
                onPress={() => handleReply(item._id, item.userProfile.name)}>
                <Text style={styles.replyBtnLabel}>Reply</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.actionSection}>
            <TouchableOpacity
              onPress={() => handleLikeComment(item._id, true, null)}
              style={styles.likeButton}>
              <Heart
                size={16}
                color={item.isLikedComment ? colors.Highlight3 : colors.Text2}
                fill={item.isLikedComment ? colors.Highlight3 : 'none'}
              />
              <Text style={styles.likeCount}>{item.commentLikeCount || 0}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Replies Section */}
        {isExpanded && (
          <View style={styles.repliesContainer}>
            {isLoadingReplies && repliesShown === 0 ? (
              <View style={styles.repliesLoader}>
                <ActivityIndicator size="small" color={colors.Primary} />
                <Text style={styles.loadingText}>Loading replies...</Text>
              </View>
            ) : (
              <>
                {replies.map(reply => (
                  <View key={reply._id}>
                    {renderReplyComment({item: reply})}
                  </View>
                ))}

                {/* Load More Replies Button */}
                {hasMoreReplies && (
                  <TouchableOpacity
                    style={styles.loadMoreRepliesBtn}
                    onPress={() => handleLoadMoreReplies(item._id)}
                    disabled={isLoadingReplies}>
                    {isLoadingReplies ? (
                      <ActivityIndicator size="small" color={colors.Primary} />
                    ) : (
                      <Text style={styles.loadMoreRepliesText}>
                        Load more replies
                      </Text>
                    )}
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        )}
      </View>
    );
  };

  const renderFooter = () => {
    if (!isLoading) return null;
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="small" color={colors.Primary} />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Comments</Text>

      {isLoading && currentPage === 1 ? (
        <View style={styles.centerLoader}>
          <ActivityIndicator size="large" color={colors.Primary} />
          <Text style={styles.loadingText}>Loading comments...</Text>
        </View>
      ) : parentComments.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No comments yet</Text>
          <Text style={styles.emptySubText}>Be the first to comment!</Text>
        </View>
      ) : (
        <BottomSheetFlatList
          data={parentComments}
          contentContainerStyle={styles.listSection}
          keyExtractor={item => item._id?.toString()}
          renderItem={renderParentComment}
          onEndReached={handleLoadMoreParents}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
        />
      )}

      <View style={styles.commentInputSection}>
        {replyingTo && (
          <View style={styles.replyingToContainer}>
            <Text style={styles.replyingToText}>
              Replying to {replyingTo.userName}
            </Text>
            <TouchableOpacity onPress={cancelReply}>
              <X size={16} color={colors.Text2} />
            </TouchableOpacity>
          </View>
        )}
        <View style={styles.inputRow}>
          <TextInput
            placeholder={replyingTo ? 'Write a reply...' : 'Add comment'}
            value={commentText}
            onChangeText={setCommentText}
            style={styles.input}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[
              styles.iconBtn,
              (!commentText.trim() || isSubmitting) && styles.iconBtnDisabled,
            ]}
            onPress={addComment}
            disabled={!commentText.trim() || isSubmitting}>
            {isSubmitting ? (
              <ActivityIndicator size="small" color={colors.Primary} />
            ) : (
              <Send size={20} color={colors.Primary} />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default Comments;

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
    gap: 10,
  },
  loadingText: {
    fontSize: 12,
    color: colors.Text2,
    fontFamily: fonts.Regular,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
    color: colors.Text1,
    fontFamily: fonts.Medium,
  },
  emptySubText: {
    fontSize: 12,
    color: colors.Text2,
    fontFamily: fonts.Regular,
  },
  listSection: {
    gap: 16,
    paddingBottom: 20,
  },
  parentCommentWrapper: {
    gap: 8,
  },
  sectionGroup: {
    flexDirection: 'row',
    gap: 12,
    flex: 1,
  },
  commentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  commentSection: {
    flex: 1,
    gap: 4,
  },
  sectionPair: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.Background1,
  },
  replyAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.Background1,
  },
  userName: {
    fontSize: 12,
    color: colors.Text1,
    fontFamily: fonts.SemiBold,
  },
  userNameTag: {
    fontSize: 10,
    color: colors.Text2,
    fontFamily: fonts.Regular,
    // marginTop: 2,
  },
  commentText: {
    fontSize: 14,
    color: colors.Text1,
    fontFamily: fonts.Regular,
    lineHeight: 20,
  },
  commentTime: {
    fontSize: 10,
    color: colors.Text2,
    fontFamily: fonts.Regular,
  },
  showReplyBtn: {
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  showReplyBtnLabel: {
    fontSize: 12,
    color: colors.Text2,
    fontFamily: fonts.Medium,
  },
  replyBtnLabel: {
    fontSize: 12,
    color: colors.Primary,
    fontFamily: fonts.Medium,
  },
  actionSection: {
    paddingTop: 4,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  likeButton: {
    alignItems: 'center',
    gap: 4,
    padding: 4,
  },
  likeCount: {
    fontSize: 11,
    color: colors.Text2,
    fontFamily: fonts.Regular,
  },
  loaderContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },

  // Reply styles
  repliesContainer: {
    marginLeft: 28,
    gap: 12,
  },
  replyCommentContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  replyLine: {
    width: 2,
    backgroundColor: colors.Background3,
    marginLeft: 8,
  },
  replyContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  repliesLoader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
  },

  // Comment Input styles
  commentInputSection: {
    position: 'absolute',
    bottom: 1,
    width: '100%',
    backgroundColor: colors.Background1,
    paddingTop: 8,
  },
  replyingToContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.Background2,
    borderRadius: 8,
    marginBottom: 8,
  },
  replyingToText: {
    fontSize: 12,
    color: colors.Text2,
    fontFamily: fonts.Medium,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    borderWidth: 0.5,
    borderColor: colors.Outline,
    flex: 1,
    color: colors.Text1,
    fontFamily: fonts.Regular,
    fontSize: 14,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    maxHeight: 100,
  },
  iconBtn: {
    backgroundColor: colors.Background3,
    padding: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBtnDisabled: {
    opacity: 0.5,
  },
});
