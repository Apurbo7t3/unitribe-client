// src/pages/Posts.jsx 
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { postService, clubService } from '../services/api';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Search,
  Plus,
  Filter,
  X,
  BookOpen,
  MessageSquare,
  Heart,
  Share2,
  Users,
  MoreVertical,
  AlertCircle,
  Send,
} from 'lucide-react';

const Posts = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [userClubs, setUserClubs] = useState([]);
  const [commentText, setCommentText] = useState(''); // For quick comment
  const [commentingPostId, setCommentingPostId] = useState(null); // Track which post is being commented on
  const [commentLoading, setCommentLoading] = useState(false);
  
  const postTypes = ['announcement', 'blog', 'resource', 'question', 'general'];

  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    post_type: 'general',
    club: '',
    file: null,
  });

  useEffect(() => {
    fetchPosts();
    fetchUserClubs();
  }, []);

  useEffect(() => {
    filterPosts();
  }, [posts, searchTerm, typeFilter]);

  const fetchUserClubs = async () => {
    try {
      const response = await clubService.getMyClubs();
      setUserClubs(response.data);
    } catch (error) {
      console.error('Error fetching clubs:', error);
    }
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await postService.getAll();
      console.log('Fetched posts:', response.data);
      setPosts(response.data);
      setFilteredPosts(response.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterPosts = () => {
    let filtered = posts;
    if (searchTerm) {
      filtered = filtered.filter(post =>
        post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.content?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (typeFilter) {
      filtered = filtered.filter(post => post.post_type === typeFilter);
    }
    setFilteredPosts(filtered);
  };

  const handleLike = async (postId) => {
    try {
      const post = posts.find(p => p.id === postId);
      if (post?.is_liked) {
        await postService.unlike(postId);
      } else {
        await postService.like(postId);
      }
      fetchPosts();
    } catch (error) {
      console.error('Error liking post:', error.response?.data || error.message);
      alert('Failed to like post. Please try again.');
    }
  };

  const handleAddComment = async (postId) => {
    if (!commentText.trim() || !postId) return;
    
    setCommentLoading(true);
    setCommentingPostId(postId);
    
    try {
      console.log('Adding comment to post:', postId, 'Content:', commentText);
      
      // Make sure we're sending the correct data structure
      const commentData = {
        content: commentText.trim()
      };
      
      console.log('Comment data:', commentData);
      
      // Call the API
      const response = await postService.addComment(postId, commentData);
      console.log('Comment response:', response);
      
      if (response.status === 200 || response.status === 201) {
        // Clear comment input
        setCommentText('');
        // Refresh posts to show new comment
        fetchPosts();
        alert('Comment added successfully!');
      } else {
        throw new Error(`API returned status: ${response.status}`);
      }
    } catch (error) {
      console.error('Full error details:', error);
      console.error('Error response:', error.response);
      console.error('Error message:', error.message);
      alert(`Failed to add comment: ${error.response?.data?.detail || error.message}`);
    } finally {
      setCommentLoading(false);
      setCommentingPostId(null);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    
    if (!newPost.title.trim() || !newPost.content.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('title', newPost.title);
      formData.append('content', newPost.content);
      formData.append('post_type', newPost.post_type);
      if (newPost.club) formData.append('club', newPost.club);
      if (newPost.file) formData.append('file', newPost.file);

      await postService.create(formData);
      
      setNewPost({
        title: '',
        content: '',
        post_type: 'general',
        club: '',
        file: null,
      });
      setShowCreateModal(false);
      fetchPosts();
      alert('Post created successfully!');
      
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post. Please try again.');
    }
  };

  const handleDeletePost = async () => {
    if (!postToDelete) return;
    
    try {
      await postService.delete(postToDelete.id);
      setShowDeleteModal(false);
      setPostToDelete(null);
      fetchPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const sharePost = (postId) => {
    const postUrl = `${window.location.origin}/posts/${postId}`;
    navigator.clipboard.writeText(postUrl);
    alert('Post link copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Campus Feed</h1>
          <p className="text-gray-600">Stay updated with campus news and discussions</p>
        </div>
        <Button
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setShowCreateModal(true)}
          className="mt-4 sm:mt-0"
        >
          Create Post
        </Button>
      </div>

      <Card>
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-y-0 md:space-x-4">
          <div className="flex-1">
            <Input
              placeholder="Search posts..."
              leftIcon={<Search className="w-5 h-5 text-gray-400" />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="">All Types</option>
              {postTypes.map(type => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
            {typeFilter && (
              <button
                onClick={() => setTypeFilter('')}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </Card>

      {filteredPosts.length === 0 ? (
        <Card className="text-center py-12">
          <BookOpen className="w-12 h-12 mx-auto text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No posts found</h3>
          <p className="mt-2 text-gray-600">
            {searchTerm || typeFilter
              ? 'Try changing your search criteria'
              : 'Be the first to create a post!'}
          </p>
          <Button
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setShowCreateModal(true)}
            className="mt-4"
          >
            Create Post
          </Button>
        </Card>
      ) : (
        <div className="space-y-6">
          {filteredPosts.map((post) => (
            <Card key={post.id} className="hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden">
                      {post.author_details?.profile_picture ? (
                        <img
                          src={post.author_details.profile_picture}
                          alt={post.author_details.first_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="font-semibold text-blue-600">
                            {post.author_details?.first_name?.charAt(0) || 'U'}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="ml-3">
                      <div className="flex items-center">
                        <h3 className="font-semibold">
                          {post.author_details?.first_name} {post.author_details?.last_name}
                        </h3>
                        {post.club_details && (
                          <>
                            <span className="mx-2 text-gray-400">•</span>
                            <div className="flex items-center text-sm text-blue-600">
                              <Users className="w-4 h-4 mr-1" />
                              {post.club_details.name}
                            </div>
                          </>
                        )}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <span>{new Date(post.created_at).toLocaleString()}</span>
                        <span className="mx-2">•</span>
                        <span className="capitalize">{post.post_type}</span>
                      </div>
                    </div>
                  </div>
                  
                  {(post.author === user?.id || user?.role === 'admin') && (
                    <div className="relative">
                      <button
                        onClick={() => {
                          setPostToDelete(post);
                          setShowDeleteModal(true);
                        }}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>

                <Link to={`/posts/${post.id}`}>
                  <h3 className="text-xl font-bold mb-3 hover:text-blue-600">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {post.content}
                  </p>
                </Link>

                {post.file && (
                  <div className="mt-3 mb-4">
                    <img
                      src={post.file}
                      alt={post.title}
                      className="w-full max-h-96 object-cover rounded-lg"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center space-x-6">
                    <button
                      onClick={() => handleLike(post.id)}
                      className={`flex items-center space-x-2 ${
                        post.is_liked ? 'text-red-600' : 'text-gray-600 hover:text-red-600'
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${post.is_liked ? 'fill-current' : ''}`} />
                      <span>{post.like_count || 0}</span>
                    </button>
                    <Link
                      to={`/posts/${post.id}`}
                      className="flex items-center space-x-2 text-gray-600 hover:text-blue-600"
                    >
                      <MessageSquare className="w-5 h-5" />
                      <span>{post.comment_count || 0}</span>
                    </Link>
                    <button
                      onClick={() => sharePost(post.id)}
                      className="flex items-center space-x-2 text-gray-600 hover:text-green-600"
                    >
                      <Share2 className="w-5 h-5" />
                      <span>Share</span>
                    </button>
                  </div>
                  <Link
                    to={`/posts/${post.id}`}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Read more →
                  </Link>
                </div>

                {/* Quick Comment Section */}
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="Write a comment..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={commentingPostId === post.id ? commentText : ''}
                        onChange={(e) => setCommentText(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleAddComment(post.id);
                          }
                        }}
                      />
                    </div>
                    <button
                      onClick={() => handleAddComment(post.id)}
                      disabled={!commentText.trim() || commentLoading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      {commentLoading && commentingPostId === post.id ? (
                        <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Post"
        size="lg"
      >
        <form onSubmit={handleCreatePost} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Post Title *
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter post title"
              value={newPost.title}
              onChange={(e) => setNewPost({...newPost, title: e.target.value})}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content *
            </label>
            <textarea
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows="6"
              placeholder="What's on your mind?"
              value={newPost.content}
              onChange={(e) => setNewPost({...newPost, content: e.target.value})}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Post Type
              </label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={newPost.post_type}
                onChange={(e) => setNewPost({...newPost, post_type: e.target.value})}
              >
                {postTypes.map(type => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Club (Optional)
              </label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={newPost.club}
                onChange={(e) => setNewPost({...newPost, club: e.target.value})}
              >
                <option value="">No club</option>
                {userClubs.map(club => (
                  <option key={club.id} value={club.id}>
                    {club.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Attach Image (Optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setNewPost({...newPost, file: e.target.files[0]})}
              className="w-full text-sm text-gray-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowCreateModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              Publish Post
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setPostToDelete(null);
        }}
        title="Delete Post"
        size="md"
      >
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Are you sure?
          </h3>
          <p className="text-gray-600 mb-6">
            This action cannot be undone. This will permanently delete the post
            "{postToDelete?.title}".
          </p>
          <div className="flex justify-center space-x-3">
            <Button
              variant="secondary"
              onClick={() => {
                setShowDeleteModal(false);
                setPostToDelete(null);
              }}
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

export default Posts;