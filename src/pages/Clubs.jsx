// src/pages/Clubs.jsx - SIMPLIFIED CLUB CREATION

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { clubService } from '../services/api';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import { Search, Plus, Users, Filter, X, AlertCircle } from 'lucide-react';

const Clubs = () => {
  const [clubs, setClubs] = useState([]);
  const [filteredClubs, setFilteredClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);
  
  const [newClub, setNewClub] = useState({
    name: '',
    description: '',
    category: '',
    meeting_schedule: '',
    rules: '',
    website: '',
    contact_email: '',
    faculty_advisor: '', // Can be empty for demo
  });

  useEffect(() => {
    fetchClubs();
  }, []);

  useEffect(() => {
    filterClubs();
  }, [clubs, searchTerm, categoryFilter]);

  const fetchClubs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await clubService.getAll();
      console.log('Clubs fetched:', response.data);
      setClubs(response.data || []);
    } catch (error) {
      console.error('Error fetching clubs:', error);
      setError('Failed to load clubs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filterClubs = () => {
    let filtered = clubs;

    if (searchTerm) {
      filtered = filtered.filter(club =>
        club.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        club.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter) {
      filtered = filtered.filter(club => club.category === categoryFilter);
    }

    setFilteredClubs(filtered);
  };

  const handleJoinClub = async (clubId) => {
    try {
      await clubService.join(clubId);
      fetchClubs(); // Refresh list
      alert('Successfully joined the club!');
    } catch (error) {
      console.error('Error joining club:', error);
      alert(error.response?.data?.error || 'Failed to join club. Please try again.');
    }
  };

  const handleCreateClub = async (e) => {
  e.preventDefault();
  
  // Basic validation
  if (!newClub.name.trim() || !newClub.description.trim()) {
    alert('Please fill in club name and description');
    return;
  }

  setCreating(true);
  setError(null);

  try {
    // Prepare club data - handle empty strings properly
    const clubData = {
      name: newClub.name.trim(),
      description: newClub.description.trim(),
      category: newClub.category.trim() || 'General',
      meeting_schedule: newClub.meeting_schedule.trim() || '',
      rules: newClub.rules.trim() || '',
      website: newClub.website.trim() || '',
      contact_email: newClub.contact_email.trim() || '',
    };
    
    // Only add faculty_advisor if it's not empty
    if (newClub.faculty_advisor && newClub.faculty_advisor.trim()) {
      clubData.faculty_advisor = newClub.faculty_advisor.trim();
    }

    console.log('Creating club with data:', clubData);

    const response = await clubService.create(clubData);
    console.log('Club created:', response.data);
    
    // Reset form
    setNewClub({
      name: '',
      description: '',
      category: '',
      meeting_schedule: '',
      rules: '',
      website: '',
      contact_email: '',
      faculty_advisor: '',
    });
    
    setShowCreateModal(false);
    fetchClubs(); // Refresh clubs list
    alert('Club created successfully! It will be available after admin approval.');
  } catch (error) {
    console.error('Error creating club:', error.response || error);
    setError(error.response?.data?.error || 'Failed to create club. Please try again.');
  } finally {
    setCreating(false);
  }
};

  // Extract unique categories for filter
  const categories = [...new Set(clubs.map(club => club.category).filter(Boolean))];

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
          <h1 className="text-2xl font-bold text-gray-900">Clubs & Organizations</h1>
          <p className="text-gray-600">Discover and join university clubs</p>
        </div>
        <Button
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setShowCreateModal(true)}
          className="mt-4 sm:mt-0"
        >
          Create Club
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
              placeholder="Search clubs..."
              leftIcon={<Search className="w-5 h-5 text-gray-400" />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            {categoryFilter && (
              <button
                onClick={() => setCategoryFilter('')}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* Clubs Grid */}
      {filteredClubs.length === 0 ? (
        <Card className="text-center py-12">
          <Users className="w-12 h-12 mx-auto text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No clubs found</h3>
          <p className="mt-2 text-gray-600">
            {searchTerm || categoryFilter
              ? 'Try changing your search criteria'
              : 'Be the first to create a club!'}
          </p>
          <Button
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setShowCreateModal(true)}
            className="mt-4"
          >
            Create Club
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredClubs.map((club) => (
            <Card key={club.id} className="hover:shadow-md transition-shadow">
              <Link to={`/clubs/${club.id}`}>
                <div className="aspect-w-16 aspect-h-9 bg-gray-100 rounded-t-xl overflow-hidden">
                  {club.logo ? (
                    <img
                      src={club.logo}
                      alt={club.name}
                      className="object-cover w-full h-48"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-48 bg-linear-to-br from-primary-50 to-primary-100">
                      <Users className="w-16 h-16 text-primary-600" />
                    </div>
                  )}
                </div>
              </Link>
              <Card.Body>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <Link to={`/clubs/${club.id}`}>
                      <h3 className="text-lg font-semibold text-gray-900 hover:text-primary-600">
                        {club.name}
                      </h3>
                    </Link>
                    {club.category && (
                      <span className="inline-block px-2 py-1 mt-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full">
                        {club.category}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Users className="w-4 h-4 mr-1" />
                    {club.member_count || 0}
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {club.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      club.status === 'active' ? 'bg-green-100 text-green-800' :
                      club.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {club.status}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant={club.is_member ? 'secondary' : 'primary'}
                    onClick={() => handleJoinClub(club.id)}
                    disabled={club.is_member || club.status !== 'active'}
                  >
                    {club.is_member ? 'Joined' : 'Join'}
                  </Button>
                </div>
              </Card.Body>
            </Card>
          ))}
        </div>
      )}

      {/* Create Club Modal - Simplified for demo */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Club"
        size="lg"
      >
        <form onSubmit={handleCreateClub} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-700 bg-red-50 rounded-lg">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Club Name *
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter club name"
              value={newClub.name}
              onChange={(e) => setNewClub({...newClub, name: e.target.value})}
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
              placeholder="Describe your club's purpose and activities..."
              value={newClub.description}
              onChange={(e) => setNewClub({...newClub, description: e.target.value})}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category (Optional)
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="e.g., Technology, Sports"
                value={newClub.category}
                onChange={(e) => setNewClub({...newClub, category: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meeting Schedule (Optional)
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="e.g., Every Tuesday, 4 PM"
                value={newClub.meeting_schedule}
                onChange={(e) => setNewClub({...newClub, meeting_schedule: e.target.value})}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rules (Optional)
            </label>
            <textarea
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              rows="3"
              placeholder="Club rules and guidelines..."
              value={newClub.rules}
              onChange={(e) => setNewClub({...newClub, rules: e.target.value})}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website (Optional)
              </label>
              <input
                type="url"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="https://example.com"
                value={newClub.website}
                onChange={(e) => setNewClub({...newClub, website: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Email (Optional)
              </label>
              <input
                type="email"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="contact@club.com"
                value={newClub.contact_email}
                onChange={(e) => setNewClub({...newClub, contact_email: e.target.value})}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Faculty Advisor ID (Optional - for demo)
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Leave empty for demo"
              value={newClub.faculty_advisor}
              onChange={(e) => setNewClub({...newClub, faculty_advisor: e.target.value})}
            />
            <p className="mt-1 text-sm text-gray-500">
              Note: For project presentation, you can leave this empty.
            </p>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowCreateModal(false)}
              disabled={creating}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              loading={creating}
              disabled={creating}
            >
              Create Club
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Clubs;