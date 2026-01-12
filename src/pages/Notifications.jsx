// src/pages/Notifications.jsx
import React, { useState } from 'react';
import { useNotifications } from '../context/NotificationContext';
import Card from '../components/Card';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import { Bell, Check, Calendar, Users, MessageSquare, X } from 'lucide-react';

const Notifications = () => {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications();
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read'

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'event':
        return <Calendar className="w-5 h-5 text-blue-500" />;
      case 'club':
        return <Users className="w-5 h-5 text-green-500" />;
      case 'message':
        return <MessageSquare className="w-5 h-5 text-purple-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const filteredNotifications = notifications.filter((notif) => {
    if (filter === 'unread') return !notif.is_read;
    if (filter === 'read') return notif.is_read;
    return true;
  });

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
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600">
            {unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`
              : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="secondary"
            leftIcon={<Check className="w-4 h-4" />}
            onClick={markAllAsRead}
            className="mt-4 sm:mt-0"
          >
            Mark all as read
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex space-x-2">
        <button
          className={`px-4 py-2 rounded-lg font-medium ${
            filter === 'all'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button
          className={`px-4 py-2 rounded-lg font-medium ${
            filter === 'unread'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          onClick={() => setFilter('unread')}
        >
          Unread
        </button>
        <button
          className={`px-4 py-2 rounded-lg font-medium ${
            filter === 'read'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          onClick={() => setFilter('read')}
        >
          Read
        </button>
      </div>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <Card className="text-center py-12">
          <Bell className="w-12 h-12 mx-auto text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            {filter === 'all' ? 'No notifications' : 'No notifications found'}
          </h3>
          <p className="mt-2 text-gray-600">
            {filter === 'all'
              ? "You're all caught up!"
              : `No ${filter} notifications`}
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notification) => (
            <Card
              key={notification.id}
              className={`${!notification.is_read ? 'bg-blue-50 border-blue-200' : ''}`}
            >
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.notification_type)}
                </div>
                <div className="flex-1 ml-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {notification.title}
                      </h4>
                      <p className="mt-1 text-gray-600">{notification.message}</p>
                      <p className="mt-2 text-sm text-gray-500">
                        {new Date(notification.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      {!notification.is_read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="p-1 text-blue-600 hover:text-blue-800"
                          title="Mark as read"
                        >
                          <Check className="w-5 h-5" />
                        </button>
                      )}
                      <button className="p-1 text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;