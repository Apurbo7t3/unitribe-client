// src/pages/EventDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventService } from '../services/api';
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
} from 'lucide-react';

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAttendeesModal, setShowAttendeesModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchEventData();
  }, [id]);

  const fetchEventData = async () => {
    try {
      setLoading(true);
      const response = await eventService.getById(id);
      setEvent(response.data);
      
      // In a real app, you would fetch attendees separately
      setAttendees([]);
    } catch (error) {
      console.error('Error fetching event:', error);
      navigate('/events');
    } finally {
      setLoading(false);
    }
  };

  const handleRSVP = async () => {
    if (!event) return;
    
    setIsProcessing(true);
    try {
      if (event.is_attending) {
        await eventService.cancelRsvp(id);
      } else {
        await eventService.rsvp(id);
      }
      fetchEventData(); // Refresh event data
    } catch (error) {
      console.error('Error updating RSVP:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    
    try {
      await eventService.delete(id);
      navigate('/events');
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const shareEvent = () => {
    const eventUrl = window.location.href;
    navigator.clipboard.writeText(eventUrl);
    alert('Event link copied to clipboard!');
  };

  if (loading || !event) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const isOrganizer = user?.id === event.organizer;
  const isAdmin = user?.role === 'admin';
  const canManage = isOrganizer || isAdmin;
  const isPast = new Date(event.end_date) < new Date();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/events')}
            className="mr-4 p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{event.title}</h1>
            <div className="flex items-center mt-1 space-x-4 text-sm text-gray-600">
              <span className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {new Date(event.start_date).toLocaleDateString()}
              </span>
              <span className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                {event.location}
              </span>
            </div>
          </div>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="secondary"
            leftIcon={<Share2 className="w-4 h-4" />}
            onClick={shareEvent}
          >
            Share
          </Button>
          {!isPast && (
            <Button
              variant={event.is_attending ? 'secondary' : 'primary'}
              leftIcon={event.is_attending ? <UserCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
              onClick={handleRSVP}
              loading={isProcessing}
              disabled={event.is_full && !event.is_attending}
            >
              {event.is_attending ? 'Attending' : 'RSVP'}
            </Button>
          )}
          {canManage && (
            <Button
              variant="secondary"
              leftIcon={<Edit className="w-4 h-4" />}
              onClick={() => setShowEditModal(true)}
            >
              Edit
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Event Description */}
          <Card>
            <Card.Header>
              <h3 className="text-lg font-semibold">Event Details</h3>
            </Card.Header>
            <Card.Body>
              <p className="text-gray-600 whitespace-pre-line">{event.description}</p>
            </Card.Body>
          </Card>

          {/* Event Information */}
          <Card>
            <Card.Header>
              <h3 className="text-lg font-semibold">Information</h3>
            </Card.Header>
            <Card.Body>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start">
                    <Calendar className="w-5 h-5 text-gray-400 mr-3 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Date</p>
                      <p className="font-medium">
                        {new Date(event.start_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Clock className="w-5 h-5 text-gray-400 mr-3 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Time</p>
                      <p className="font-medium">
                        {new Date(event.start_date).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })} - {new Date(event.end_date).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <MapPin className="w-5 h-5 text-gray-400 mr-3 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-medium">{event.location}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Users className="w-5 h-5 text-gray-400 mr-3 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Attendance</p>
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => setShowAttendeesModal(true)}
                          className="font-medium text-primary-600 hover:underline"
                        >
                          {event.attendee_count} attending
                        </button>
                        {event.max_participants && (
                          <span className="text-gray-500">
                            ({event.attendee_count}/{event.max_participants})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Event Status */}
          <Card>
            <Card.Header>
              <h3 className="text-lg font-semibold">Event Status</h3>
            </Card.Header>
            <Card.Body>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Type</span>
                  <span className="font-medium capitalize">{event.event_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status</span>
                  <span className={`font-medium ${
                    isPast ? 'text-gray-600' : 'text-green-600'
                  }`}>
                    {isPast ? 'Past Event' : 'Upcoming'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Your Status</span>
                  <span className={`font-medium ${
                    event.is_attending ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    {event.is_attending ? 'Attending' : 'Not RSVPed'}
                  </span>
                </div>
                {event.is_full && (
                  <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                    This event is at full capacity
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>

          {/* Organizer Info */}
          <Card>
            <Card.Header>
              <h3 className="text-lg font-semibold">Organizer</h3>
            </Card.Header>
            <Card.Body>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="ml-4">
                  <p className="font-medium">
                    {event.organizer_details?.first_name} {event.organizer_details?.last_name}
                  </p>
                  <p className="text-sm text-gray-500">{event.organizer_details?.role}</p>
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* Club Info (if event belongs to a club) */}
          {event.club_details && (
            <Card>
              <Card.Header>
                <h3 className="text-lg font-semibold">Hosted By</h3>
              </Card.Header>
              <Card.Body>
                <div className="flex items-center">
                  {event.club_details.logo ? (
                    <img
                      src={event.club_details.logo}
                      alt={event.club_details.name}
                      className="w-12 h-12 rounded-lg"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-primary-600" />
                    </div>
                  )}
                  <div className="ml-4">
                    <p className="font-medium">{event.club_details.name}</p>
                    <p className="text-sm text-gray-500">{event.club_details.category}</p>
                  </div>
                </div>
              </Card.Body>
            </Card>
          )}

          {/* Management Actions */}
          {canManage && (
            <Card>
              <Card.Header>
                <h3 className="text-lg font-semibold">Manage Event</h3>
              </Card.Header>
              <Card.Body className="space-y-3">
                <Button variant="secondary" className="w-full" leftIcon={<Edit className="w-4 h-4" />}>
                  Edit Event
                </Button>
                <Button variant="secondary" className="w-full">
                  View Attendees
                </Button>
                <Button variant="danger" className="w-full" leftIcon={<Trash2 className="w-4 h-4" />}>
                  Delete Event
                </Button>
              </Card.Body>
            </Card>
          )}
        </div>
      </div>

      {/* Attendees Modal */}
      <Modal
        isOpen={showAttendeesModal}
        onClose={() => setShowAttendeesModal(false)}
        title={`Event Attendees (${event.attendee_count})`}
        size="lg"
      >
        <div className="space-y-4">
          {attendees.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 mx-auto text-gray-400" />
              <p className="mt-4 text-gray-600">No attendees to show</p>
            </div>
          ) : (
            attendees.map((attendee) => (
              <div key={attendee.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="ml-3">
                    <p className="font-medium">
                      {attendee.first_name} {attendee.last_name}
                    </p>
                    <p className="text-sm text-gray-500">{attendee.department}</p>
                  </div>
                </div>
                {canManage && (
                  <Button variant="secondary" size="sm">
                    Remove
                  </Button>
                )}
              </div>
            ))
          )}
        </div>
      </Modal>
    </div>
  );
};

export default EventDetail;