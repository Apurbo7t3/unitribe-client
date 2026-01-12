// src/pages/Profile.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useForm } from 'react-hook-form';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import { User, Mail, BookOpen, Camera, Check } from 'lucide-react';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      first_name: user?.first_name,
      last_name: user?.last_name,
      bio: user?.bio || '',
      interests: user?.interests || '',
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    const result = await updateProfile(data);
    setLoading(false);
    
    if (result.success) {
      setEditing(false);
    }
  };

  const handleCancel = () => {
    reset();
    setEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600">Manage your account information</p>
        </div>
        {!editing && (
          <Button onClick={() => setEditing(true)}>
            Edit Profile
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column - Profile Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <Card.Header>
              <h3 className="text-lg font-semibold">Personal Information</h3>
            </Card.Header>
            <Card.Body>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="First Name"
                    leftIcon={<User className="w-5 h-5 text-gray-400" />}
                    disabled={!editing}
                    error={errors.first_name?.message}
                    {...register('first_name')}
                  />
                  <Input
                    label="Last Name"
                    leftIcon={<User className="w-5 h-5 text-gray-400" />}
                    disabled={!editing}
                    error={errors.last_name?.message}
                    {...register('last_name')}
                  />
                </div>

                <Input
                  label="Email"
                  leftIcon={<Mail className="w-5 h-5 text-gray-400" />}
                  value={user?.email}
                  disabled
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Role"
                    value={user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                    disabled
                  />
                  <Input
                    label="Department"
                    leftIcon={<BookOpen className="w-5 h-5 text-gray-400" />}
                    value={user?.department}
                    disabled
                  />
                </div>

                {user?.student_id && (
                  <Input
                    label="Student ID"
                    value={user?.student_id}
                    disabled
                  />
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio
                  </label>
                  <textarea
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      !editing ? 'bg-gray-50' : ''
                    }`}
                    rows="4"
                    disabled={!editing}
                    placeholder="Tell us about yourself..."
                    {...register('bio')}
                  />
                </div>

                <Input
                  label="Interests"
                  placeholder="e.g., Programming, Sports, Music"
                  disabled={!editing}
                  {...register('interests')}
                />

                {editing && (
                  <div className="flex justify-end space-x-3 pt-4">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleCancel}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" loading={loading}>
                      Save Changes
                    </Button>
                  </div>
                )}
              </form>
            </Card.Body>
          </Card>
        </div>

        {/* Right Column - Stats & Profile Picture */}
        <div className="space-y-6">
          {/* Profile Picture */}
          <Card>
            <Card.Body className="text-center">
              <div className="relative inline-block">
                <div className="w-32 h-32 mx-auto bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center">
                  {user?.profile_picture ? (
                    <img
                      src={user.profile_picture}
                      alt={user.first_name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-16 h-16 text-primary-600" />
                  )}
                </div>
                {editing && (
                  <button className="absolute bottom-0 right-0 p-2 bg-white border rounded-full shadow-sm hover:bg-gray-50">
                    <Camera className="w-5 h-5 text-gray-600" />
                  </button>
                )}
              </div>
              <h3 className="mt-4 text-lg font-semibold">
                {user?.first_name} {user?.last_name}
              </h3>
              <p className="text-gray-600">{user?.department}</p>
              <div className="mt-2">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  user?.is_verified
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {user?.is_verified ? (
                    <>
                      <Check className="w-4 h-4 mr-1" />
                      Verified
                    </>
                  ) : (
                    'Not Verified'
                  )}
                </span>
              </div>
            </Card.Body>
          </Card>

          {/* Account Stats */}
          <Card>
            <Card.Header>
              <h3 className="text-lg font-semibold">Account Stats</h3>
            </Card.Header>
            <Card.Body className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Joined</span>
                <span className="font-medium">
                  {new Date(user?.date_joined).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Last Login</span>
                <span className="font-medium">
                  {new Date(user?.last_login).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Account Status</span>
                <span className="font-medium text-green-600">Active</span>
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;