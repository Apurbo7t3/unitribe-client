// src/pages/Dashboard.jsx - FIXED WITH AUTO-REFRESH
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { eventService, clubService, postService } from '../services/api';
import Card from '../components/Card';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import {
  Calendar,
  Users,
  BookOpen,
  Plus,
  Clock,
  MapPin,
  UserPlus,
  MessageSquare,
  Heart,
  RefreshCw,
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    events: 0,
    clubs: 0,
    posts: 0,
    connections: 0,
  });
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [myClubs, setMyClubs] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [showCreateEventModal, setShowCreateEventModal] = useState(false);
  const [userClubs, setUserClubs] = useState([]);
  
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    post_type: 'general',
    club: '',
    file: null,
  });
  
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    event_type: 'social',
    start_date: '',
    end_date: '',
    location: '',
    max_participants: '',
    club: '',
  });

  // Function to fetch all dashboard data
  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      const [eventsRes, clubsRes, postsRes] = await Promise.all([
        eventService.getUpcoming(),
        clubService.getMyClubs(),
        postService.getFeed(),
      ]);
      
      console.log('Fetched posts:', postsRes.data);
      console.log('Number of posts:', postsRes.data.length);
      
      setUpcomingEvents(eventsRes.data.slice(0, 3));
      setMyClubs(clubsRes.data.slice(0, 4));
      setRecentPosts(postsRes.data.slice(0, 3));
      
      // Update stats with actual counts
      setStats({
        events: eventsRes.data.length,
        clubs: clubsRes.data.length,
        posts: postsRes.data.length,
        connections: 0,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchUserClubs = async () => {
    try {
      const response = await clubService.getMyClubs();
      setUserClubs(response.data);
    } catch (error) {
      console.error('Error fetching user clubs:', error);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchDashboardData();
    fetchUserClubs();
  }, []);

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
      
      // Reset form
      setNewPost({
        title: '',
        content: '',
        post_type: 'general',
        club: '',
        file: null,
      });
      setShowCreatePostModal(false);
      
      // Refresh ALL dashboard data
      fetchDashboardData();
      
      alert('Post created successfully!');
      
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post. Please try again.');
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    
    if (!newEvent.title.trim() || !newEvent.description.trim() || 
        !newEvent.start_date || !newEvent.location) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      await eventService.create(newEvent);
      
      // Reset form
      setNewEvent({
        title: '',
        description: '',
        event_type: 'social',
        start_date: '',
        end_date: '',
        location: '',
        max_participants: '',
        club: '',
      });
      setShowCreateEventModal(false);
      
      // Refresh ALL dashboard data
      fetchDashboardData();
      
      alert('Event created successfully!');
      
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Failed to create event. Please try again.');
    }
  };

  const handleLikePost = async (postId) => {
    try {
      const post = recentPosts.find(p => p.id === postId);
      if (post?.is_liked) {
        await postService.unlike(postId);
      } else {
        await postService.like(postId);
      }
      // Refresh posts data
      fetchDashboardData();
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleRefresh = () => {
    fetchDashboardData();
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
      {/* Header with Refresh button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.first_name}!
          </h1>
          <p className="text-gray-600">
            {user?.department} • {user?.role.charAt(0).toUpperCase() + user?.role.slice(1)}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Refresh data"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <div className="flex space-x-3">
            <Button 
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setShowCreateEventModal(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              New Event
            </Button>
            <Button 
              variant="secondary" 
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setShowCreatePostModal(true)}
            >
              Create Post
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Grid - These will update after creating posts/events */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Upcoming Events</p>
              <p className="text-2xl font-bold text-gray-900">{stats.events}</p>
              {refreshing && (
                <div className="mt-1 text-xs text-gray-500">Updating...</div>
              )}
            </div>
          </div>
        </Card>
        
        <Card className="p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">My Clubs</p>
              <p className="text-2xl font-bold text-gray-900">{stats.clubs}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Recent Posts</p>
              <p className="text-2xl font-bold text-gray-900">{stats.posts}</p>
              <div className="mt-1 text-xs text-blue-600">
                Your posts: {recentPosts.filter(post => post.author === user?.id).length}
              </div>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-lg">
              <UserPlus className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Connections</p>
              <p className="text-2xl font-bold text-gray-900">{stats.connections}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Upcoming Events Section */}
        <Card>
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center">
              <h3 className="text-lg font-semibold">Upcoming Events</h3>
              <span className="ml-2 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                {stats.events}
              </span>
            </div>
            <Link to="/events" className="text-sm text-blue-600 hover:underline">
              View all
            </Link>
          </div>
          <div className="p-6">
            {upcomingEvents.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 mx-auto text-gray-400" />
                <p className="mt-4 text-gray-500">No upcoming events</p>
                <Button
                  size="sm"
                  className="mt-4"
                  onClick={() => setShowCreateEventModal(true)}
                >
                  Create Your First Event
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{event.title}</h4>
                        <div className="flex items-center mt-1 space-x-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {new Date(event.start_date).toLocaleDateString()}
                          </span>
                          <span className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {event.location}
                          </span>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="secondary"
                        onClick={() => navigate(`/events/${event.id}`)}
                      >
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* My Clubs Section */}
        <Card>
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center">
              <h3 className="text-lg font-semibold">My Clubs</h3>
              <span className="ml-2 px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                {stats.clubs}
              </span>
            </div>
            <Link to="/clubs" className="text-sm text-blue-600 hover:underline">
              View all
            </Link>
          </div>
          <div className="p-6">
            {myClubs.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 mx-auto text-gray-400" />
                <p className="mt-4 text-gray-500">
                  You haven't joined any clubs yet
                </p>
                <Button
                  size="sm"
                  className="mt-4"
                  onClick={() => navigate('/clubs')}
                >
                  Browse Clubs
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {myClubs.map((club) => (
                  <Link
                    key={club.id}
                    to={`/clubs/${club.id}`}
                    className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center">
                      {club.logo ? (
                        <img
                          src={club.logo}
                          alt={club.name}
                          className="w-10 h-10 rounded-lg"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Users className="w-6 h-6 text-blue-600" />
                        </div>
                      )}
                      <div className="ml-3">
                        <h4 className="font-medium">{club.name}</h4>
                        <p className="text-sm text-gray-500">
                          {club.member_count} members
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Recent Posts Section - This should update after creating a post */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center">
              <h3 className="text-lg font-semibold">Recent Posts</h3>
              <span className="ml-2 px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                {stats.posts} total • {recentPosts.length} shown
              </span>
            </div>
            <Link to="/posts" className="text-sm text-blue-600 hover:underline">
              View all
            </Link>
          </div>
          <div className="p-6">
            {recentPosts.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 mx-auto text-gray-400" />
                <p className="mt-4 text-gray-500">No posts yet. Create your first post!</p>
                <Button
                  size="sm"
                  className="mt-4"
                  onClick={() => setShowCreatePostModal(true)}
                >
                  Create Your First Post
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentPosts.map((post) => (
                  <div key={post.id} className="p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                            {post.author_details?.first_name?.charAt(0) || 'U'}
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium">
                              {post.author_details?.first_name} {post.author_details?.last_name}
                              {post.author === user?.id && (
                                <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                                  You
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(post.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <h4 className="font-medium mb-2">{post.title}</h4>
                        <p className="text-gray-600 text-sm mb-3">
                          {post.content.substring(0, 150)}...
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <button 
                            onClick={() => handleLikePost(post.id)}
                            className={`flex items-center ${post.is_liked ? 'text-red-600' : 'hover:text-red-600'}`}
                          >
                            <Heart className={`w-4 h-4 mr-1 ${post.is_liked ? 'fill-current' : ''}`} />
                            {post.like_count || 0}
                          </button>
                          <button 
                            onClick={() => navigate(`/posts/${post.id}`)}
                            className="flex items-center hover:text-blue-600"
                          >
                            <MessageSquare className="w-4 h-4 mr-1" />
                            {post.comment_count || 0}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Create Post Modal */}
      <Modal
        isOpen={showCreatePostModal}
        onClose={() => setShowCreatePostModal(false)}
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
              rows="4"
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
                <option value="general">General</option>
                <option value="announcement">Announcement</option>
                <option value="question">Question</option>
                <option value="blog">Blog</option>
                <option value="resource">Resource</option>
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

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => setShowCreatePostModal(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700"
            >
              Publish Post
            </button>
          </div>
        </form>
      </Modal>

      {/* Create Event Modal */}
      <Modal
        isOpen={showCreateEventModal}
        onClose={() => setShowCreateEventModal(false)}
        title="Create New Event"
        size="lg"
      >
        <form onSubmit={handleCreateEvent} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Title *
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter event title"
              value={newEvent.title}
              onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows="4"
              placeholder="Describe your event..."
              value={newEvent.description}
              onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Type
              </label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={newEvent.event_type}
                onChange={(e) => setNewEvent({...newEvent, event_type: e.target.value})}
              >
                <option value="social">Social</option>
                <option value="academic">Academic</option>
                <option value="sports">Sports</option>
                <option value="cultural">Cultural</option>
                <option value="workshop">Workshop</option>
                <option value="seminar">Seminar</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Club (Optional)
              </label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={newEvent.club}
                onChange={(e) => setNewEvent({...newEvent, club: e.target.value})}
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date & Time *
              </label>
              <input
                type="datetime-local"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={newEvent.start_date}
                onChange={(e) => setNewEvent({...newEvent, start_date: e.target.value})}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date & Time
              </label>
              <input
                type="datetime-local"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={newEvent.end_date}
                onChange={(e) => setNewEvent({...newEvent, end_date: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location *
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter location"
                value={newEvent.location}
                onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Participants
              </label>
              <input
                type="number"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0 for unlimited"
                value={newEvent.max_participants}
                onChange={(e) => setNewEvent({...newEvent, max_participants: e.target.value})}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => setShowCreateEventModal(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700"
            >
              Create Event
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Dashboard;