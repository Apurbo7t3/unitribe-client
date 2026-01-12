// src/pages/Login.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../context/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';
import Card from '../components/Card';
import { Mail, Lock, University } from 'lucide-react';

const loginSchema = yup.object({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().required('Password is required'),
  role: yup.string().oneOf(['student', 'faculty', 'admin']).required('Role is required'),
});

const Login = () => {
  const navigate = useNavigate();
  const { login, error, setError } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      role: 'student',
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setError(null);
    
    const result = await login(data.email, data.password, data.role);
    
    setLoading(false);
    
    if (result.success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center">
            <University className="w-8 h-8 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-blue-700">
          Welcome to UniTribe
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Sign in to your university account
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="px-4 py-8 sm:px-10">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              label="Email Address"
              type="email"
              leftIcon={<Mail className="w-5 h-5 text-gray-400" />}
              error={errors.email?.message}
              {...register('email')}
            />
            
            <Input
              label="Password"
              type="password"
              leftIcon={<Lock className="w-5 h-5 text-gray-400" />}
              error={errors.password?.message}
              {...register('password')}
            />
            
            <div className="grid grid-cols-3 gap-3">
                {['student', 'faculty', 'admin'].map((role) => (
                  <label key={role} className="relative cursor-pointer">
                    <input
                      type="radio"
                      value={role}
                      {...register('role', { required: 'Please select a role' })}
                      className="peer hidden"
                    />

                    <div
                      className="
                        flex flex-col items-center justify-center
                        p-4 rounded-lg border
                        transition-all duration-200
                        border-gray-300
                        text-gray-700
                        peer-checked:bg-blue-600
                        peer-checked:border-blue-600
                        peer-checked:text-white
                      "
                    >
                      <div
                        className="
                          absolute top-2 right-2
                          hidden peer-checked:flex
                          items-center justify-center
                          w-5 h-5
                          bg-white text-blue-600
                          rounded-full text-xs font-bold
                        "
                      >
                        ✓
                      </div>

                      <span className="text-sm font-semibold capitalize">
                        {role}
                      </span>
                    </div>
                  </label>
                ))}
            </div>


            {error && (
              <div className="p-3 text-sm text-red-700 bg-red-50 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <Button
                type="submit"
                loading={loading}
                className="w-full bg-blue-600"
                size="lg"
              >
                Sign in
              </Button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <Link
                to="/register"
                className="w-full btn-secondary text-center"
              >
                Create account
              </Link>
              <Link
                to="/forgot-password"
                className="w-full btn-secondary text-center"
              >
                Forgot password?
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;