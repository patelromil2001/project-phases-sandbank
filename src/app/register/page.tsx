'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface FormData {
  name: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface ValidationErrors {
  name?: string;
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export default function RegisterPage() {
  const [form, setForm] = useState<FormData>({ 
    name: '', 
    username: '',
    email: '', 
    password: '', 
    confirmPassword: '' 
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const validatePassword = (password: string) => {
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return {
      minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar,
      isValid: minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar
    };
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    // Name validation
    if (!form.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (form.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    // Username validation (optional)
    if (form.username.trim()) {
      if (form.username.length < 3) {
        newErrors.username = 'Username must be at least 3 characters';
      } else if (form.username.length > 20) {
        newErrors.username = 'Username must be 20 characters or less';
      } else if (!/^[a-zA-Z0-9_-]+$/.test(form.username)) {
        newErrors.username = 'Username can only contain letters, numbers, underscores, and hyphens';
      }
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(form.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    const passwordValidation = validatePassword(form.password);
    if (!form.password) {
      newErrors.password = 'Password is required';
    } else if (!passwordValidation.isValid) {
      newErrors.password = 'Password does not meet requirements';
    }

    // Confirm password validation
    if (!form.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          username: form.username.trim() || undefined,
          email: form.email.toLowerCase().trim(),
          password: form.password
        }),
      });

      if (res.ok) {
        router.push('/login?message=Registration successful! Please log in.');
      } else {
        const data = await res.json();
        setServerError(data.error || 'Registration failed. Please try again.');
      }
    } catch {
      setServerError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };


  const handleInputChange = (field: keyof FormData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    // Clear field-specific error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const passwordValidation = validatePassword(form.password);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-yellow-600 border-4 border-yellow-800 flex items-center justify-center">
              <span className="text-yellow-900 text-2xl">📚</span>
            </div>
          </div>
          <h2 className="text-3xl font-extrabold text-yellow-600">
            Join Bookshelf
          </h2>
          <p className="mt-2 text-gray-600">Create your account</p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                id="name"
                placeholder="Enter your full name"
                type="text"
                value={form.name}
                onChange={e => handleInputChange('name', e.target.value)}
                className={`appearance-none relative block w-full px-3 py-3 border-2 bg-white placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm transition-colors ${
                  errors.name ? 'border-red-600' : 'border-yellow-600'
                }`}
                aria-describedby={errors.name ? 'name-error' : undefined}
              />
              {errors.name && (
                <p id="name-error" className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Username <span className="text-gray-500">(Optional)</span>
              </label>
              <input
                id="username"
                placeholder="Enter a username (optional)"
                type="text"
                value={form.username}
                onChange={e => handleInputChange('username', e.target.value)}
                className={`appearance-none relative block w-full px-3 py-3 border-2 bg-white placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm transition-colors ${
                  errors.username ? 'border-red-600' : 'border-yellow-600'
                }`}
                aria-describedby={errors.username ? 'username-error' : undefined}
              />
              {errors.username && (
                <p id="username-error" className="mt-1 text-sm text-red-600">{errors.username}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">3-20 characters, letters, numbers, underscores, hyphens</p>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                id="email"
                placeholder="Enter your email"
                type="email"
                value={form.email}
                onChange={e => handleInputChange('email', e.target.value)}
                className={`appearance-none relative block w-full px-3 py-3 border-2 bg-white placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm transition-colors ${
                  errors.email ? 'border-red-600' : 'border-yellow-600'
                }`}
                aria-describedby={errors.email ? 'email-error' : undefined}
              />
              {errors.email && (
                <p id="email-error" className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                placeholder="Create a strong password"
                type="password"
                value={form.password}
                onChange={e => handleInputChange('password', e.target.value)}
                className={`appearance-none relative block w-full px-3 py-3 border-2 bg-white placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm transition-colors ${
                  errors.password ? 'border-red-600' : 'border-yellow-600'
                }`}
                aria-describedby={errors.password ? 'password-error' : 'password-requirements'}
              />
              
              {/* Password Requirements */}
              {form.password && (
                <div id="password-requirements" className="mt-2 text-xs space-y-1">
                  <p className="font-medium text-gray-700">Password requirements:</p>
                  <div className="grid grid-cols-1 gap-1">
                    <span className={`flex items-center ${passwordValidation.minLength ? 'text-green-600' : 'text-red-600'}`}>
                      {passwordValidation.minLength ? '✓' : '✗'} At least 8 characters
                    </span>
                    <span className={`flex items-center ${passwordValidation.hasUpperCase ? 'text-green-600' : 'text-red-600'}`}>
                      {passwordValidation.hasUpperCase ? '✓' : '✗'} One uppercase letter
                    </span>
                    <span className={`flex items-center ${passwordValidation.hasLowerCase ? 'text-green-600' : 'text-red-600'}`}>
                      {passwordValidation.hasLowerCase ? '✓' : '✗'} One lowercase letter
                    </span>
                    <span className={`flex items-center ${passwordValidation.hasNumbers ? 'text-green-600' : 'text-red-600'}`}>
                      {passwordValidation.hasNumbers ? '✓' : '✗'} One number
                    </span>
                    <span className={`flex items-center ${passwordValidation.hasSpecialChar ? 'text-green-600' : 'text-red-600'}`}>
                      {passwordValidation.hasSpecialChar ? '✓' : '✗'} One special character
                    </span>
                  </div>
                </div>
              )}
              
              {errors.password && (
                <p id="password-error" className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                placeholder="Confirm your password"
                type="password"
                value={form.confirmPassword}
                onChange={e => handleInputChange('confirmPassword', e.target.value)}
                className={`appearance-none relative block w-full px-3 py-3 border-2 bg-white placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm transition-colors ${
                  errors.confirmPassword ? 'border-red-600' : 'border-yellow-600'
                }`}
                aria-describedby={errors.confirmPassword ? 'confirm-password-error' : undefined}
              />
              {errors.confirmPassword && (
                <p id="confirm-password-error" className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>
          </div>

          {/* Server Error */}
          {serverError && (
            <div className="bg-red-50 border-2 border-red-600 rounded-md p-3" role="alert">
              <p className="text-red-600 text-sm">{serverError}</p>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border-2 border-yellow-600 text-sm font-medium rounded-md text-yellow-900 bg-yellow-400 hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-describedby={loading ? 'loading-text' : undefined}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-900 mr-2"></div>
                  <span id="loading-text">Creating Account...</span>
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link 
                href="/login" 
                className="font-medium text-yellow-600 hover:text-yellow-500 transition-colors"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
