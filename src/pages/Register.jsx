// src/pages/Register.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../context/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';
import Card from '../components/Card';
import { Mail, Lock, User, BookOpen, Hash } from 'lucide-react';

const registerSchema = yup.object({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .matches(/[A-Z]/, 'Must contain an uppercase letter')
    .matches(/[a-z]/, 'Must contain a lowercase letter')
    .matches(/[0-9]/, 'Must contain a number')
    .required('Password is required'),
  password2: yup
    .string()
    .oneOf([yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required'),
  first_name: yup.string().required('First name is required'),
  last_name: yup.string().required('Last name is required'),
  role: yup.string().oneOf(['student', 'faculty']).required('Role is required'),
  student_id: yup.string().when('role', {
    is: 'student',
    then: (schema) => schema.required('Student ID is required for students'),
    otherwise: (schema) => schema.notRequired(),
  }),
  department: yup.string().required('Department is required'),
});

const Register = () => {
  const navigate = useNavigate();
  const { register: registerUser, error } = useAuth(); // Remove setError from here
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState('student');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(registerSchema),
    defaultValues: {
      role: 'student',
    },
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const role = watch('role');

  const onSubmit = async (data) => {
  console.log('Registration form data:', data);
  setLoading(true);
  
  console.log('Calling registerUser...');
  const result = await registerUser(data);
  console.log('Registration result:', result);
  setLoading(false);
  
  if (result.success) {
    console.log('Registration successful, redirecting...');
    navigate('/dashboard');
  } else {
    console.log('Registration failed:', result.error);
  }
};

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-700">Join UniTribe</h1>
          <p className="mt-2 text-gray-600">
            Create your university community account
          </p>
        </div>
        <Card>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-5">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                leftIcon={<User className="w-5 h-5 text-gray-400" />}
                error={errors.first_name?.message}
                {...register('first_name')}
              />
              <Input
                label="Last Name"
                leftIcon={<User className="w-5 h-5 text-gray-400" />}
                error={errors.last_name?.message}
                {...register('last_name')}
              />
            </div>
            <Input
              label="Email Address"
              type="email"
              leftIcon={<Mail className="w-5 h-5 text-gray-400" />}
              error={errors.email?.message}
              {...register('email')}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Password"
                type="password"
                leftIcon={<Lock className="w-5 h-5 text-gray-400" />}
                error={errors.password?.message}
                {...register('password')}
              />
              <Input
                label="Confirm Password"
                type="password"
                leftIcon={<Lock className="w-5 h-5 text-gray-400" />}
                error={errors.password2?.message}
                {...register('password2')}
              />
            </div>
            <div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    I am a
  </label>

              <div className="grid grid-cols-2 gap-3">
                {['student', 'faculty'].map((roleOption) => {
                  const isSelected = selectedRole === roleOption;

                  return (
                    <label
                      key={roleOption}
                      className={`flex flex-col items-center p-4 border rounded-lg cursor-pointer transition
                        ${
                          isSelected
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                      <input
                        type="radio"
                        value={roleOption}
                        className="sr-only"
                        {...register('role')}
                        onChange={() => setSelectedRole(roleOption)}
                      />

                      <div className={`text-sm font-medium capitalize`}>
                        {roleOption}
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {selectedRole === 'student' && (
              <Input
                label="Student ID"
                leftIcon={<Hash className="w-5 h-5 text-gray-400" />}
                error={errors.student_id?.message}
                {...register('student_id')}
              />
            )}
            <Input
              label="Department"
              leftIcon={<BookOpen className="w-5 h-5 text-gray-400" />}
              error={errors.department?.message}
              {...register('department')}
            />

            {error && (
              <div className="p-3 text-sm text-red-700 bg-red-50 rounded-lg">
                {typeof error === 'object' ? JSON.stringify(error) : error}
              </div>
            )}

            <div className="flex items-center">
              <input
                id="terms"
                type="checkbox"
                className="w-4 h-4 text-primary-600 border-gray-300 rounded"
                required
              />
              <label htmlFor="terms" className="ml-2 text-sm text-gray-600">
                I agree to the{' '}
                <Link to="/terms" className="text-primary-600 hover:underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-primary-600 hover:underline">
                  Privacy Policy
                </Link>
              </label>
            </div>
            <Button
              type="submit"
              loading={loading}
              className="w-full bg-blue-600"
              size="lg"
            >
              Create Account
            </Button>
          </form>
          <div className="mt-6 text-center mb-3">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-600 hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Register;