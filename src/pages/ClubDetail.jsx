// src/pages/ClubDetail.jsx - ENHANCED VERSION

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { clubService, eventService, postService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Card from '../components/Card';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import Input from '../components/Input';
import {
    Users,
    Calendar,
    MessageSquare,
    MapPin,
    Mail,
    Globe,
    BookOpen,
    Settings,
    UserPlus,
    UserMinus,
    Edit,
    Trash2,
    ArrowLeft,
    Plus,
    Clock,
    MoreVertical,
    Check,
    X,
    Star,
} from 'lucide-react';

const ClubDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const [club, setClub] = useState(null);
    const [posts, setPosts] = useState([]);
    const [events, setEvents] = useState([]);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showMembersModal, setShowMembersModal] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [showCreateEventModal, setShowCreateEventModal] = useState(false);
    const [showMembershipRequestsModal, setShowMembershipRequestsModal] = useState(false);
    const [isJoining, setIsJoining] = useState(false);
    const [membershipRequests, setMembershipRequests] = useState([]);
    const [clubRoles, setClubRoles] = useState([]);
    
    // New event form
    const [newEvent, setNewEvent] = useState({
        title: '',
        description: '',
        event_type: 'social',
        start_date: '',
        end_date: '',
        location: '',
        max_participants: '',
    });

    useEffect(() => {
        fetchClubData();
    }, [id]);

    const fetchClubData = async () => {
        try {
            setLoading(true);
            const [clubRes, postsRes, eventsRes, membersRes, rolesRes] = await Promise.all([
                clubService.getClubById(id),
                postService.getAllPosts({ club: id }),
                eventService.getAllEvents({ club: id, status: 'upcoming' }),
                clubService.getClubMembers(id),
                clubService.getClubRoles(id),
            ]);
            
            setClub(clubRes.data);
            setPosts(postsRes.data);
            setEvents(eventsRes.data);
            setMembers(membersRes.data);
            setClubRoles(rolesRes.data);
            
            // If user can manage, fetch membership requests
            if (clubRes.data?.can_manage) {
                const requestsRes = await clubService.getMembershipRequests(id);
                setMembershipRequests(requestsRes.data);
            }
        } catch (error) {
            console.error('Error fetching club data:', error);
            navigate('/clubs');
        } finally {
            setLoading(false);
        }
    };

    const handleJoinLeave = async () => {
        if (!club) return;
        
        setIsJoining(true);
        try {
            if (club.is_member) {
                await clubService.leaveClub(id);
            } else {
                await clubService.joinClub(id);
            }
            fetchClubData(); // Refresh data
        } catch (error) {
            console.error('Error:', error);
            alert(error.response?.data?.error || 'An error occurred');
        } finally {
            setIsJoining(false);
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
            const eventData = {
                ...newEvent,
                club: club.id,
                start_date: new Date(newEvent.start_date).toISOString(),
                end_date: newEvent.end_date ? new Date(newEvent.end_date).toISOString() : null,
                max_participants: newEvent.max_participants || null,
            };

            await eventService.createEvent(eventData);
            
            // Reset form
            setNewEvent({
                title: '',
                description: '',
                event_type: 'social',
                start_date: '',
                end_date: '',
                location: '',
                max_participants: '',
            });
            
            setShowCreateEventModal(false);
            fetchClubData(); // Refresh to show new event
            alert('Event created successfully!');
        } catch (error) {
            console.error('Error creating event:', error);
            alert('Failed to create event. Please try again.');
        }
    };

    const handleDeleteClub = async () => {
        if (!window.confirm('Are you sure you want to delete this club? This action cannot be undone.')) return;
        
        try {
            await clubService.deleteClub(id);
            navigate('/clubs');
        } catch (error) {
            console.error('Error deleting club:', error);
            alert('Failed to delete club. Please try again.');
        }
    };

    const handleProcessMembershipRequest = async (requestId, action) => {
        try {
            await clubService.processMembershipRequest(id, requestId, action);
            fetchClubData(); // Refresh data
            alert(`Membership request ${action}ed successfully`);
        } catch (error) {
            console.error('Error processing request:', error);
            alert('Failed to process request');
        }
    };

    const handleAssignRole = async (userId, role) => {
        try {
            await clubService.assignClubRole(id, {
                user: userId,
                role: role,
            });
            fetchClubData(); // Refresh data
            alert('Role assigned successfully');
        } catch (error) {
            console.error('Error assigning role:', error);
            alert('Failed to assign role');
        }
    };

    if (loading || !club) {
        return (
            <div className="flex items-center justify-center h-64">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    const isAdmin = user?.role === 'admin' || user?.id === club.president;
    const canManage = isAdmin || user?.id === club.faculty_advisor || club.can_manage;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <button
                        onClick={() => navigate('/clubs')}
                        className="mr-4 p-2 hover:bg-gray-100 rounded-lg"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{club.name}</h1>
                        <p className="text-gray-600">{club.category}</p>
                    </div>
                </div>
                <div className="flex space-x-3">
                    <Button
                        variant={club.is_member ? 'secondary' : 'primary'}
                        leftIcon={club.is_member ? <UserMinus className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                        onClick={handleJoinLeave}
                        loading={isJoining}
                    >
                        {club.is_member ? 'Leave Club' : 'Join Club'}
                    </Button>
                    
                    {canManage && (
                        <Button
                            variant="secondary"
                            leftIcon={<Settings className="w-4 h-4" />}
                            onClick={() => setShowSettingsModal(true)}
                        >
                            Manage
                        </Button>
                    )}
                    
                    {club.is_member && (
                        <Button
                            variant="primary"
                            leftIcon={<Plus className="w-4 h-4" />}
                            onClick={() => setShowCreateEventModal(true)}
                        >
                            Create Event
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Club Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Club Description */}
                    <Card>
                        <Card.Header>
                            <h3 className="text-lg font-semibold">About</h3>
                        </Card.Header>
                        <Card.Body>
                            <p className="text-gray-600 whitespace-pre-line">{club.description}</p>
                            <div className="mt-6 grid grid-cols-2 gap-4">
                                {club.meeting_schedule && (
                                    <div className="flex items-center">
                                        <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                                        <div>
                                            <p className="text-sm text-gray-500">Meetings</p>
                                            <p className="font-medium">{club.meeting_schedule}</p>
                                        </div>
                                    </div>
                                )}
                                {club.website && (
                                    <div className="flex items-center">
                                        <Globe className="w-5 h-5 text-gray-400 mr-3" />
                                        <div>
                                            <p className="text-sm text-gray-500">Website</p>
                                            <a
                                                href={club.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="font-medium text-primary-600 hover:underline"
                                            >
                                                Visit Website
                                            </a>
                                        </div>
                                    </div>
                                )}
                                {club.contact_email && (
                                    <div className="flex items-center">
                                        <Mail className="w-5 h-5 text-gray-400 mr-3" />
                                        <div>
                                            <p className="text-sm text-gray-500">Contact</p>
                                            <p className="font-medium">{club.contact_email}</p>
                                        </div>
                                    </div>
                                )}
                                <div className="flex items-center">
                                    <Users className="w-5 h-5 text-gray-400 mr-3" />
                                    <div>
                                        <p className="text-sm text-gray-500">Members</p>
                                        <button
                                            onClick={() => setShowMembersModal(true)}
                                            className="font-medium text-primary-600 hover:underline"
                                        >
                                            {club.member_count} members
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>

                    {/* Club Events */}
                    <Card>
                        <Card.Header className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold">Upcoming Events</h3>
                            {club.is_member && (
                                <Button
                                    size="sm"
                                    leftIcon={<Plus className="w-4 h-4" />}
                                    onClick={() => setShowCreateEventModal(true)}
                                >
                                    New Event
                                </Button>
                            )}
                        </Card.Header>
                        <Card.Body>
                            {events.length === 0 ? (
                                <div className="text-center py-8">
                                    <Calendar className="w-12 h-12 mx-auto text-gray-400" />
                                    <h4 className="mt-4 text-lg font-medium text-gray-900">No upcoming events</h4>
                                    <p className="mt-2 text-gray-600">Be the first to organize an event!</p>
                                    {club.is_member && (
                                        <Button 
                                            className="mt-4"
                                            onClick={() => setShowCreateEventModal(true)}
                                        >
                                            Create Event
                                        </Button>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {events.slice(0, 5).map((event) => (
                                        <div 
                                            key={event.id} 
                                            className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                                            onClick={() => navigate(`/events/${event.id}`)}
                                        >
                                            <div className="flex items-center justify-between mb-3">
                                                <div>
                                                    <h4 className="font-medium">{event.title}</h4>
                                                    <div className="flex items-center mt-1 space-x-4 text-sm text-gray-500">
                                                        <span className="flex items-center">
                                                            <Calendar className="w-4 h-4 mr-1" />
                                                            {new Date(event.start_date).toLocaleDateString()}
                                                        </span>
                                                        <span className="flex items-center">
                                                            <MapPin className="w-4 h-4 mr-1" />
                                                            {event.location}
                                                        </span>
                                                        <span className="flex items-center">
                                                            <Users className="w-4 h-4 mr-1" />
                                                            {event.attendee_count} attending
                                                        </span>
                                                    </div>
                                                </div>
                                                <Button 
                                                    size="sm" 
                                                    variant={event.is_attending ? 'secondary' : 'primary'}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (event.is_attending) {
                                                            eventService.cancelRsvp(event.id).then(fetchClubData);
                                                        } else {
                                                            eventService.rsvpEvent(event.id).then(fetchClubData);
                                                        }
                                                    }}
                                                >
                                                    {event.is_attending ? 'Attending' : 'RSVP'}
                                                </Button>
                                            </div>
                                            <p className="text-gray-600 text-sm">
                                                {event.description.substring(0, 200)}...
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Card.Body>
                    </Card>

                    {/* Club Posts */}
                    <Card>
                        <Card.Header>
                            <h3 className="text-lg font-semibold">Club Posts</h3>
                        </Card.Header>
                        <Card.Body>
                            {posts.length === 0 ? (
                                <div className="text-center py-8">
                                    <MessageSquare className="w-12 h-12 mx-auto text-gray-400" />
                                    <h4 className="mt-4 text-lg font-medium text-gray-900">No posts yet</h4>
                                    <p className="mt-2 text-gray-600">Be the first to share something!</p>
                                    <Button 
                                        className="mt-4"
                                        onClick={() => navigate('/posts?club=' + id)}
                                    >
                                        Create Post
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {posts.slice(0, 5).map((post) => (
                                        <div 
                                            key={post.id} 
                                            className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                                            onClick={() => navigate(`/posts/${post.id}`)}
                                        >
                                            <div className="flex items-center mb-3">
                                                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                                    {post.author_details?.first_name?.charAt(0) || 'U'}
                                                </div>
                                                <div className="ml-3">
                                                    <p className="font-medium">
                                                        {post.author_details?.first_name} {post.author_details?.last_name}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {new Date(post.created_at).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <h4 className="font-medium mb-2">{post.title}</h4>
                                            <p className="text-gray-600 text-sm">
                                                {post.content.substring(0, 200)}...
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </div>

                {/* Right Column - Leadership & Info */}
                <div className="space-y-6">
                    {/* Club Leadership */}
                    <Card>
                        <Card.Header>
                            <h3 className="text-lg font-semibold">Leadership</h3>
                        </Card.Header>
                        <Card.Body className="space-y-4">
                            {clubRoles.filter(role => 
                                ['president', 'vice_president', 'secretary', 'treasurer'].includes(role.role)
                            ).map((role) => (
                                <div key={role.id} className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                            role.role === 'president' ? 'bg-blue-100' :
                                            role.role === 'vice_president' ? 'bg-purple-100' :
                                            role.role === 'secretary' ? 'bg-green-100' : 'bg-yellow-100'
                                        }`}>
                                            {role.role === 'president' ? <Star className="w-6 h-6 text-blue-600" /> :
                                             role.role === 'vice_president' ? <Users className="w-6 h-6 text-purple-600" /> :
                                             role.role === 'secretary' ? <BookOpen className="w-6 h-6 text-green-600" /> :
                                             <Users className="w-6 h-6 text-yellow-600" />}
                                        </div>
                                        <div className="ml-3">
                                            <p className="font-medium capitalize">{role.role.replace('_', ' ')}</p>
                                            <p className="text-sm text-gray-600">
                                                {role.user_details?.first_name} {role.user_details?.last_name}
                                            </p>
                                        </div>
                                    </div>
                                    {canManage && role.role !== 'president' && (
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            onClick={() => {
                                                if (window.confirm(`Remove ${role.user_details?.first_name} as ${role.role}?`)) {
                                                    // Handle role removal
                                                }
                                            }}
                                        >
                                            Remove
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </Card.Body>
                    </Card>

                    {/* Club Rules */}
                    {club.rules && (
                        <Card>
                            <Card.Header>
                                <h3 className="text-lg font-semibold">Club Rules</h3>
                            </Card.Header>
                            <Card.Body>
                                <p className="text-gray-600 whitespace-pre-line text-sm">{club.rules}</p>
                            </Card.Body>
                        </Card>
                    )}

                    {/* Club Stats */}
                    <Card>
                        <Card.Header>
                            <h3 className="text-lg font-semibold">Club Stats</h3>
                        </Card.Header>
                        <Card.Body className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Status</span>
                                <span className={`font-medium ${
                                    club.status === 'active' ? 'text-green-600' : 
                                    club.status === 'pending' ? 'text-yellow-600' : 
                                    'text-red-600'
                                }`}>
                                    {club.status.charAt(0).toUpperCase() + club.status.slice(1)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Created</span>
                                <span className="font-medium">
                                    {new Date(club.created_at).toLocaleDateString()}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Last Updated</span>
                                <span className="font-medium">
                                    {new Date(club.updated_at).toLocaleDateString()}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Active Members</span>
                                <span className="font-medium">{club.active_member_count}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Upcoming Events</span>
                                <span className="font-medium">{club.upcoming_events_count}</span>
                            </div>
                        </Card.Body>
                    </Card>
                </div>
            </div>

            {/* Members Modal */}
            <Modal
                isOpen={showMembersModal}
                onClose={() => setShowMembersModal(false)}
                title={`Club Members (${members.length})`}
                size="lg"
            >
                <div className="space-y-4">
                    {members.map((member) => (
                        <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center">
                                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                    {member.first_name?.charAt(0) || 'U'}
                                </div>
                                <div className="ml-3">
                                    <p className="font-medium">
                                        {member.first_name} {member.last_name}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {member.role} • {member.department}
                                    </p>
                                </div>
                            </div>
                            {canManage && member.id !== user?.id && (
                                <div className="flex space-x-2">
                                    <select
                                        className="px-3 py-1 border rounded"
                                        defaultValue=""
                                        onChange={(e) => {
                                            if (e.target.value) {
                                                handleAssignRole(member.id, e.target.value);
                                            }
                                        }}
                                    >
                                        <option value="">Assign Role</option>
                                        <option value="vice_president">Vice President</option>
                                        <option value="secretary">Secretary</option>
                                        <option value="treasurer">Treasurer</option>
                                        <option value="member">Member</option>
                                    </select>
                                    <Button 
                                        variant="danger" 
                                        size="sm"
                                        onClick={() => {
                                            if (window.confirm(`Remove ${member.first_name} from club?`)) {
                                                // Handle member removal
                                            }
                                        }}
                                    >
                                        Remove
                                    </Button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
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
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Max Participants (Optional)
                        </label>
                        <input
                            type="number"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="0 for unlimited"
                            value={newEvent.max_participants}
                            onChange={(e) => setNewEvent({...newEvent, max_participants: e.target.value})}
                            min="0"
                        />
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

            {/* Club Settings Modal */}
            {canManage && (
                <Modal
                    isOpen={showSettingsModal}
                    onClose={() => setShowSettingsModal(false)}
                    title="Club Settings"
                    size="lg"
                >
                    <div className="space-y-6">
                        <div className="flex space-x-4">
                            <Button
                                variant="secondary"
                                leftIcon={<Edit className="w-4 h-4" />}
                                className="flex-1"
                                onClick={() => {
                                    setShowSettingsModal(false);
                                    // Navigate to edit club page
                                }}
                            >
                                Edit Club
                            </Button>
                            <Button
                                variant="danger"
                                leftIcon={<Trash2 className="w-4 h-4" />}
                                onClick={handleDeleteClub}
                                className="flex-1"
                            >
                                Delete Club
                            </Button>
                        </div>
                        <div>
                            <h4 className="font-medium mb-3">Membership Requests</h4>
                            <Button 
                                variant="secondary" 
                                className="w-full"
                                onClick={() => setShowMembershipRequestsModal(true)}
                            >
                                View Pending Requests ({membershipRequests.length})
                            </Button>
                        </div>
                        <div>
                            <h4 className="font-medium mb-3">Club Events</h4>
                            <Button 
                                variant="secondary" 
                                className="w-full"
                                onClick={() => {
                                    setShowSettingsModal(false);
                                    setShowCreateEventModal(true);
                                }}
                            >
                                Create New Event
                            </Button>
                        </div>
                        <div>
                            <h4 className="font-medium mb-3">Export Data</h4>
                            <Button variant="secondary" className="w-full">
                                Export Member List
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Membership Requests Modal */}
            <Modal
                isOpen={showMembershipRequestsModal}
                onClose={() => setShowMembershipRequestsModal(false)}
                title="Pending Membership Requests"
                size="lg"
            >
                <div className="space-y-4">
                    {membershipRequests.length === 0 ? (
                        <div className="text-center py-8">
                            <Users className="w-12 h-12 mx-auto text-gray-400" />
                            <p className="mt-4 text-gray-600">No pending membership requests</p>
                        </div>
                    ) : (
                        membershipRequests.map((request) => (
                            <div key={request.id} className="p-4 border rounded-lg">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                            {request.user_details?.first_name?.charAt(0) || 'U'}
                                        </div>
                                        <div className="ml-3">
                                            <p className="font-medium">
                                                {request.user_details?.first_name} {request.user_details?.last_name}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {request.user_details?.role} • {request.user_details?.department}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {new Date(request.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                                {request.message && (
                                    <p className="text-gray-600 text-sm mb-4">"{request.message}"</p>
                                )}
                                <div className="flex space-x-3">
                                    <Button
                                        variant="secondary"
                                        className="flex-1"
                                        onClick={() => handleProcessMembershipRequest(request.id, 'reject')}
                                    >
                                        Reject
                                    </Button>
                                    <Button
                                        variant="primary"
                                        className="flex-1"
                                        onClick={() => handleProcessMembershipRequest(request.id, 'approve')}
                                    >
                                        Approve
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </Modal>
        </div>
    );
};

export default ClubDetail;