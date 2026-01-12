// src/pages/Messages.jsx
import React, { useState, useEffect, useRef } from 'react';
import { messagingService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import {
  Search,
  Send,
  UserPlus,
  MoreVertical,
  Check,
  CheckCheck,
  Image as ImageIcon,
  Paperclip,
  Smile,
} from 'lucide-react';

const Messages = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchConversations();
  });

  useEffect(() => {
    if (activeConversation) {
      fetchMessages(activeConversation.id);
    }
  }, [activeConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await messagingService.getConversations();
      setConversations(response.data);
      
      // Set first conversation as active if none selected
      if (response.data.length > 0 && !activeConversation) {
        setActiveConversation(response.data[0]);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const response = await messagingService.getMessages(conversationId);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation) return;

    setSending(true);
    try {
      await messagingService.sendMessage(activeConversation.id, {
        content: newMessage,
      });
      setNewMessage('');
      fetchMessages(activeConversation.id); // Refresh messages
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const filteredConversations = conversations.filter(conv => {
    if (!searchTerm) return true;
    
    if (conv.is_group) {
      return conv.group_name.toLowerCase().includes(searchTerm.toLowerCase());
    } else {
      const otherUser = conv.other_participant;
      if (otherUser) {
        return (
          otherUser.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          otherUser.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          otherUser.username.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
    }
    return false;
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-600">Chat with students and faculty</p>
        </div>
        <Button
          leftIcon={<UserPlus className="w-4 h-4" />}
          onClick={() => setShowNewChatModal(true)}
        >
          New Chat
        </Button>
      </div>

      <div className="flex h-[calc(100vh-200px)] bg-white border rounded-lg overflow-hidden">
        {/* Conversations List */}
        <div className="w-full md:w-80 border-r flex flex-col">
          {/* Search */}
          <div className="p-4 border-b">
            <Input
              placeholder="Search conversations..."
              leftIcon={<Search className="w-5 h-5 text-gray-400" />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p>No conversations found</p>
                <Button
                  variant="secondary"
                  className="mt-4"
                  onClick={() => setShowNewChatModal(true)}
                >
                  Start a new chat
                </Button>
              </div>
            ) : (
              filteredConversations.map((conversation) => (
                <button
                  key={conversation.id}
                  className={`w-full p-4 border-b hover:bg-gray-50 text-left ${
                    activeConversation?.id === conversation.id ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => setActiveConversation(conversation)}
                >
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                      {conversation.is_group ? (
                        <span className="font-semibold text-primary-600">
                          {conversation.group_name.charAt(0)}
                        </span>
                      ) : (
                        <span className="font-semibold text-primary-600">
                          {conversation.other_participant?.first_name?.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className="ml-3 flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">
                          {conversation.is_group
                            ? conversation.group_name
                            : `${conversation.other_participant?.first_name} ${conversation.other_participant?.last_name}`}
                        </h3>
                        {conversation.last_message && (
                          <span className="text-xs text-gray-500">
                            {new Date(conversation.last_message.created_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 truncate">
                        {conversation.last_message
                          ? conversation.last_message.content
                          : 'No messages yet'}
                      </p>
                      {conversation.unread_count > 0 && (
                        <span className="inline-block mt-1 px-2 py-1 text-xs font-medium bg-primary-600 text-white rounded-full">
                          {conversation.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col hidden md:flex">
          {activeConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    {activeConversation.is_group ? (
                      <span className="font-semibold text-primary-600">
                        {activeConversation.group_name.charAt(0)}
                      </span>
                    ) : (
                      <span className="font-semibold text-primary-600">
                        {activeConversation.other_participant?.first_name?.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div className="ml-3">
                    <h3 className="font-semibold">
                      {activeConversation.is_group
                        ? activeConversation.group_name
                        : `${activeConversation.other_participant?.first_name} ${activeConversation.other_participant?.last_name}`}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {activeConversation.is_group
                        ? `${activeConversation.participants_details?.length || 0} members`
                        : activeConversation.other_participant?.role}
                    </p>
                  </div>
                </div>
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-gray-500">
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  messages.map((message) => {
                    const isOwnMessage = message.sender === user?.id;
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md rounded-lg p-3 ${
                            isOwnMessage
                              ? 'bg-primary-600 text-white rounded-br-none'
                              : 'bg-gray-100 text-gray-900 rounded-bl-none'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <div className={`flex items-center justify-end mt-1 text-xs ${
                            isOwnMessage ? 'text-primary-200' : 'text-gray-500'
                          }`}>
                            <span>
                              {new Date(message.created_at).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                            {isOwnMessage && (
                              <span className="ml-1">
                                {message.is_read ? (
                                  <CheckCheck className="w-3 h-3 inline" />
                                ) : (
                                  <Check className="w-3 h-3 inline" />
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t">
                <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                  <button type="button" className="p-2 hover:bg-gray-100 rounded-lg">
                    <Paperclip className="w-5 h-5 text-gray-500" />
                  </button>
                  <button type="button" className="p-2 hover:bg-gray-100 rounded-lg">
                    <ImageIcon className="w-5 h-5 text-gray-500" />
                  </button>
                  <div className="flex-1">
                    <Input
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="border-none focus:ring-0"
                    />
                  </div>
                  <button type="button" className="p-2 hover:bg-gray-100 rounded-lg">
                    <Smile className="w-5 h-5 text-gray-500" />
                  </button>
                  <Button
                    type="submit"
                    loading={sending}
                    disabled={!newMessage.trim()}
                    className="px-4"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              <div className="text-center">
                <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
                <p>Choose a conversation from the list or start a new one</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Chat Modal */}
      <Modal
        isOpen={showNewChatModal}
        onClose={() => setShowNewChatModal(false)}
        title="New Chat"
        size="md"
      >
        <div className="space-y-4">
          <Input placeholder="Search users..." leftIcon={<Search className="w-5 h-5" />} />
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {/* Sample users - in real app, fetch from API */}
            {[
              { id: 1, name: 'John Doe', role: 'Student', department: 'Computer Science' },
              { id: 2, name: 'Jane Smith', role: 'Faculty', department: 'Engineering' },
              { id: 3, name: 'Bob Johnson', role: 'Student', department: 'Business' },
            ].map((user) => (
              <button
                key={user.id}
                className="w-full p-3 border rounded-lg hover:bg-gray-50 text-left"
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="ml-3">
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-gray-500">
                      {user.role} • {user.department}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
          <div className="pt-4 border-t">
            <Button className="w-full">Start Group Chat</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Messages;