// src/pages/PostDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { postService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Card from '../components/Card';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  ArrowLeft,
  Edit,
  Trash2,
  Share2,
  UserPlus,
  UserCheck,
  Heart,
  MessageSquare,
  Send,
  X,
} from 'lucide-react';

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [isLiking, setIsLiking] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchPostData();
  }, [id]);

  const fetchPostData = async () => {
    try {
      setLoading(true);
      const response = await postService.getById(id);
      setPost(response.data);
      setComments(response.data.comments || []);
      setError(null);
    } catch (error) {
      console.error('Error fetching post:', error);
      setError('Failed to load post. Please try again.');
      navigate('/posts');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!post) return;
    
    setIsLiking(true);
    try {
      if (post.is_liked) {
        await postService.unlike(id);
      } else {
        await postService.like(id);
      }
      fetchPostData();
    } catch (error) {
      console.error('Error liking post:', error);
      setError('Failed to like post. Please try again.');
    } finally {
      setIsLiking(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    
    if (!newComment.trim()) {
      setError('Please enter a comment.');
      return;
    }

    setIsCommenting(true);
    setError(null);
    
    try {
      console.log('Adding comment to post:', id, 'Content:', newComment);
      
      // Prepare the comment data
      const commentData = {
        content: newComment.trim()
      };
      
      console.log('Sending comment data:', commentData);
      
      // Try to make the API call
      const response = await postService.addComment(id, commentData);
      console.log('Comment response:', response);
      
      if (response.status === 200 || response.status === 201) {
        // Clear comment input
        setNewComment('');
        // Refresh comments
        fetchPostData();
      } else {
        throw new Error(`API returned status: ${response.status}`);
      }
    } catch (error) {
      console.error('Full error details:', error);
      
      // Display the actual error message
      let errorMessage = 'Failed to add comment. ';
      
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        
        if (error.response.data && typeof error.response.data === 'object') {
          // If it's an object, try to extract meaningful error messages
          if (error.response.data.detail) {
            errorMessage += error.response.data.detail;
          } else if (error.response.data.content) {
            errorMessage += error.response.data.content;
          } else if (error.response.data.non_field_errors) {
            errorMessage += error.response.data.non_field_errors.join(', ');
          } else {
            // Stringify the entire error object
            errorMessage += JSON.stringify(error.response.data, null, 2);
          }
        } else if (error.response.data) {
          errorMessage += error.response.data;
        } else {
          errorMessage += `Server error: ${error.response.status}`;
        }
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request);
        errorMessage += 'No response from server. Please check your connection.';
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error setting up request:', error.message);
        errorMessage += error.message;
      }
      
      setError(errorMessage);
      alert(errorMessage);
    } finally {
      setIsCommenting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      await postService.deleteComment(id, commentId);
      fetchPostData();
    } catch (error) {
      console.error('Error deleting comment:', error);
      setError('Failed to delete comment. Please try again.');
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      await postService.delete(id);
      navigate('/posts');
    } catch (error) {
      console.error('Error deleting post:', error);
      setError('Failed to delete post. Please try again.');
    }
  };

  const sharePost = () => {
    const postUrl = window.location.href;
    navigator.clipboard.writeText(postUrl);
    alert('Post link copied to clipboard!');
  };

  if (loading || !post) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const isAuthor = user?.id === post.author;
  const isAdmin = user?.role === 'admin';
  const canManage = isAuthor || isAdmin;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/posts')}
            className="mr-4 p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Post Details</h1>
            <p className="text-gray-600">
              {post.post_type.charAt(0).toUpperCase() + post.post_type.slice(1)}
            </p>
          </div>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="secondary"
            leftIcon={<Share2 className="w-4 h-4" />}
            onClick={sharePost}
          >
            Share
          </Button>
          {canManage && (
            <Button
              variant="secondary"
              leftIcon={<Trash2 className="w-4 h-4" />}
              onClick={() => setShowDeleteModal(true)}
            >
              Delete
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <X className="w-5 h-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    {post.author_details?.profile_picture ? (
                      <img
                        src={post.author_details.profile_picture}
                        alt={post.author_details.first_name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="font-semibold text-blue-600">
                          {post.author_details?.first_name?.charAt(0) || 'U'}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="ml-4">
                    <h3 className="font-semibold">
                      {post.author_details?.first_name} {post.author_details?.last_name}
                    </h3>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(post.created_at).toLocaleString()}
                      {post.club_details && (
                        <>
                          <span className="mx-2">•</span>
                          <Users className="w-4 h-4 mr-1" />
                          {post.club_details.name}
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <span className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                  {post.post_type}
                </span>
              </div>

              <h2 className="text-xl font-bold mb-4">{post.title}</h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-line">{post.content}</p>
              </div>

              {post.file && (
                <div className="mt-6">
                  <img
                    src={post.file}
                    alt={post.title}
                    className="w-full max-h-96 object-cover rounded-lg"
                  />
                </div>
              )}

              <div className="mt-6 pt-6 border-t">
                <div className="flex items-center space-x-6">
                  <button
                    onClick={handleLike}
                    disabled={isLiking}
                    className={`flex items-center space-x-2 ${
                      post.is_liked ? 'text-red-600' : 'text-gray-600 hover:text-red-600'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${post.is_liked ? 'fill-current' : ''}`} />
                    <span>{post.like_count} Likes</span>
                  </button>
                  <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-600">
                    <MessageSquare className="w-5 h-5" />
                    <span>{comments.length} Comments</span>
                  </button>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Comments ({comments.length})</h3>
              
              <form onSubmit={handleAddComment} className="mb-6">
                <div className="flex space-x-2">
                  <div className="flex-1">
                    <textarea
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Write a comment..."
                      rows={3}
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      disabled={isCommenting}
                    />
                  </div>
                  <Button
                    type="submit"
                    loading={isCommenting}
                    disabled={!newComment.trim() || isCommenting}
                    className="self-end"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </form>

              <div className="space-y-4">
                {comments.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    No comments yet. Be the first to comment!
                  </p>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start">
                          <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                          <div className="ml-3 flex-1">
                            <div className="flex items-center">
                              <h4 className="font-medium">
                                {comment.author_details?.first_name} {comment.author_details?.last_name}
                              </h4>
                              <span className="mx-2 text-gray-400">•</span>
                              <span className="text-sm text-gray-500">
                                {new Date(comment.created_at).toLocaleString()}
                              </span>
                            </div>
                            <p className="mt-2 text-gray-700">{comment.content}</p>
                          </div>
                        </div>
                        {(user?.id === comment.author || canManage) && (
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="text-gray-400 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Author</h3>
              <div className="text-center">
                <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto flex items-center justify-center">
                  {post.author_details?.profile_picture ? (
                    <img
                      src={post.author_details.profile_picture}
                      alt={post.author_details.first_name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl font-semibold text-blue-600">
                        {post.author_details?.first_name?.charAt(0) || 'U'}
                      </span>
                    </div>
                  )}
                </div>
                <h4 className="mt-4 font-semibold">
                  {post.author_details?.first_name} {post.author_details?.last_name}
                </h4>
                <p className="text-gray-600">{post.author_details?.role}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {post.author_details?.department}
                </p>
                <Button variant="secondary" className="w-full mt-4">
                  Follow
                </Button>
              </div>
            </div>
          </Card>

          {post.club_details && (
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">Posted in Club</h3>
                <div className="flex items-center">
                  {post.club_details.logo ? (
                    <img
                      src={post.club_details.logo}
                      alt={post.club_details.name}
                      className="w-12 h-12 rounded-lg"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                  )}
                  <div className="ml-4">
                    <p className="font-medium">{post.club_details.name}</p>
                    <p className="text-sm text-gray-500">{post.club_details.category}</p>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="mt-2"
                      onClick={() => navigate(`/clubs/${post.club_details.id}`)}
                    >
                      View Club
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          )}

          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Post Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Likes</span>
                  <span className="font-medium">{post.like_count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Comments</span>
                  <span className="font-medium">{comments.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Posted</span>
                  <span className="font-medium">
                    {new Date(post.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Updated</span>
                  <span className="font-medium">
                    {new Date(post.updated_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Post"
        size="md"
      >
        <div className="text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Are you sure?
          </h3>
          <p className="text-gray-600 mb-6">
            This action cannot be undone. This will permanently delete the post
            "{post.title}".
          </p>
          <div className="flex justify-center space-x-3">
            <Button
              variant="secondary"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeletePost}>
              Delete Post
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PostDetail;