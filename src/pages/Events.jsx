// src/pages/Events.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { eventService, clubService } from '../services/api';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Search,
  Plus,
  Calendar,
  MapPin,
  Users,
  Clock,
  Filter,
  X,
  UserCheck,
  UserPlus,
  AlertCircle,
} from 'lucide-react';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [userClubs, setUserClubs] = useState([]);
  const [error, setError] = useState(null);
  
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    event_type: 'social',
    club: '',
    start_date: '',
    end_date: '',
    location: '',
    max_participants: '',
  });

  const eventTypes = [
    'academic',
    'social',
    'sports',
    'cultural',
    'workshop',
    'seminar',
  ];

  useEffect(() => {
    fetchEvents();
    fetchUserClubs();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [events, searchTerm, typeFilter, statusFilter]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await eventService.getAll({ status: 'upcoming' });
      console.log('Events fetched:', response.data);
      setEvents(response.data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      setError('Failed to load events. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserClubs = async () => {
    try {
      const response = await clubService.getMyClubs();
      setUserClubs(response.data || []);
    } catch (error) {
      console.error('Error fetching user clubs:', error);
    }
  };

  const filterEvents = () => {
    let filtered = events;
    const now = new Date();

    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (typeFilter) {
      filtered = filtered.filter(event => event.event_type === typeFilter);
    }

    if (statusFilter) {
      if (statusFilter === 'upcoming') {
        filtered = filtered.filter(event => new Date(event.start_date) > now);
      } else if (statusFilter === 'past') {
        filtered = filtered.filter(event => new Date(event.end_date) < now);
      } else if (statusFilter === 'ongoing') {
        filtered = filtered.filter(event => 
          new Date(event.start_date) <= now && 
          new Date(event.end_date) >= now
        );
      }
    }

    setFilteredEvents(filtered);
  };

  const handleRSVP = async (eventId, isAttending) => {
    try {
      if (isAttending) {
        await eventService.cancelRsvp(eventId);
        alert('RSVP cancelled successfully!');
      } else {
        await eventService.rsvp(eventId);
        alert('Successfully RSVPed to the event!');
      }
      fetchEvents(); // Refresh list
    } catch (error) {
      console.error('Error RSVPing to event:', error);
      alert(error.response?.data?.error || 'Failed to update RSVP. Please try again.');
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    
    // Prepare event data with proper formatting
    const eventData = {
      title: newEvent.title.trim(),
      description: newEvent.description.trim(),
      event_type: newEvent.event_type,
      start_date: newEvent.start_date ? new Date(newEvent.start_date).toISOString() : '',
      end_date: newEvent.end_date ? new Date(newEvent.end_date).toISOString() : '',
      location: newEvent.location.trim(),
      max_participants: newEvent.max_participants || null,
      club: newEvent.club || null,
    };

    console.log('Creating event with data:', eventData);

    // Validation
    if (!eventData.title || !eventData.description || !eventData.start_date || !eventData.location) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      await eventService.create(eventData);
      
      // Reset form
      setNewEvent({
        title: '',
        description: '',
        event_type: 'social',
        club: '',
        start_date: '',
        end_date: '',
        location: '',
        max_participants: '',
      });
      
      setShowCreateModal(false);
      fetchEvents(); // Refresh events list
      alert('Event created successfully!');
    } catch (error) {
      console.error('Error creating event:', error.response || error);
      alert(error.response?.data?.error || 'Failed to create event. Please try again.');
    }
  };

  const formatDateTime = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });
    } catch (error) {
      return 'Invalid date'+error;
    }
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Events</h1>
          <p className="text-gray-600">Discover and join university events</p>
        </div>
        <Button
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setShowCreateModal(true)}
          className="mt-4 sm:mt-0"
        >
          Create Event
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-400 mr-3" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <Card>
        <div className="flex flex-col p-2 space-y-4 md:flex-row md:items-center md:space-y-0 md:space-x-4">
          <div className="flex-1">
            <Input
              placeholder="Search events..."
              leftIcon={<Search className="w-5 h-5 text-gray-400" />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="">All Types</option>
              {eventTypes.map(type => (
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
          
          <div className="flex items-center space-x-2">
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="upcoming">Upcoming</option>
              <option value="ongoing">Ongoing</option>
              <option value="past">Past</option>
            </select>
            {statusFilter && (
              <button
                onClick={() => setStatusFilter('')}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* Events List */}
      {filteredEvents.length === 0 ? (
        <Card className="text-center py-12">
          <Calendar className="w-12 h-12 mx-auto text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No events found</h3>
          <p className="mt-2 text-gray-600">
            {searchTerm || typeFilter || statusFilter
              ? 'Try changing your search criteria'
              : 'Be the first to create an event!'}
          </p>
          <Button
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setShowCreateModal(true)}
            className="mt-4"
          >
            Create Event
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredEvents.map((event) => (
            <Card key={event.id} className="hover:shadow-md transition-shadow">
              <div className="flex flex-col lg:flex-row">
                {/* Event Date */}
                <div className="lg:w-32 flex-shrink-0 p-4 border-r">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary-600">
                      {new Date(event.start_date).getDate()}
                    </div>
                    <div className="text-sm text-gray-600">
                      {new Date(event.start_date).toLocaleString('default', { month: 'short' })}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(event.start_date).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>

                {/* Event Details */}
                <div className="flex-1 p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Link to={`/events/${event.id}`}>
                        <h3 className="text-lg font-semibold text-gray-900 hover:text-primary-600">
                          {event.title}
                        </h3>
                      </Link>
                      <div className="flex flex-wrap items-center mt-2 space-x-4 text-sm text-gray-600">
                        <span className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {event.location}
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {formatDateTime(event.start_date)}
                        </span>
                        <span className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          {event.attendee_count || 0} attending
                        </span>
                        <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                          {event.event_type}
                        </span>
                      </div>
                      <p className="mt-3 text-gray-600 line-clamp-2">
                        {event.description}
                      </p>
                    </div>
                    <div className="ml-4 flex flex-col items-end space-y-2">
                      <Button
                        variant={event.is_attending ? 'secondary' : 'primary'}
                        leftIcon={event.is_attending ? 
                          <UserCheck className="w-4 h-4" /> : 
                          <UserPlus className="w-4 h-4" />
                        }
                        onClick={() => handleRSVP(event.id, event.is_attending)}
                        disabled={event.is_full && !event.is_attending}
                        size="sm"
                      >
                        {event.is_attending ? 'Attending' : 'RSVP'}
                      </Button>
                      {event.is_full && !event.is_attending && (
                        <p className="text-xs text-red-600">Event is full</p>
                      )}
                      <Link
                        to={`/events/${event.id}`}
                        className="text-sm text-primary-600 hover:text-primary-700"
                      >
                        View Details →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Event Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                value={newEvent.event_type}
                onChange={(e) => setNewEvent({...newEvent, event_type: e.target.value})}
              >
                {eventTypes.map(type => (
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="0 for unlimited"
                value={newEvent.max_participants}
                onChange={(e) => setNewEvent({...newEvent, max_participants: e.target.value})}
                min="0"
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowCreateModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              Create Event
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Events;