'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

type UserType = {
  _id: string;
  name: string;
  email: string;
  profileSlug?: string;
};

export default function DashboardPage() {
  const { user, loading } = useAuth();
  // Use user type or null initially
  const [userData, setUserData] = useState<UserType | null>(null);
  const [slugLoading, setSlugLoading] = useState(false);
  const [slugError, setSlugError] = useState('');
  const [slugSuccess, setSlugSuccess] = useState('');

  // Keep userData in sync with user prop
  useEffect(() => {
    if (user) {
      setUserData(user);
    }
  }, [user]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  const handleSlugUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSlugLoading(true);
    setSlugError('');
    setSlugSuccess('');

    const form = e.currentTarget;
    const slugInput = form.elements.namedItem('slug') as HTMLInputElement | null;
    if (!slugInput) {
      setSlugError('Slug input not found');
      setSlugLoading(false);
      return;
    }
    const slug = slugInput.value.trim();

    if (!/^[a-z0-9-]+$/.test(slug)) {
      setSlugError('Slug can only contain lowercase letters, numbers, and hyphens');
      setSlugLoading(false);
      return;
    }

    if (slug.length < 3 || slug.length > 20) {
      setSlugError('Slug must be between 3 and 20 characters');
      setSlugLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/users/slug', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      });

      if (res.ok) {
        toast.success('Profile URL updated successfully!');
        setSlugSuccess('Profile URL updated successfully!');
        slugInput.value = '';
        setUserData((prev) =>
          prev ? { ...prev, profileSlug: slug } : prev
        );
      } else {
        const data = await res.json();
        const err = data.error || 'Failed to update profile URL';
        setSlugError(err);
        toast.error(err);
      }
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : 'Network error occurred';
      setSlugError(errMsg);
      toast.error(errMsg);
    } finally {
      setSlugLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Link copied to clipboard!');
    } catch {
      toast.error('Failed to copy link');
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600" />
          <span className="ml-3 text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-red-50 border-2 border-red-600 rounded-lg p-6 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">
            You need to log in to check this page
          </h1>
        </div>
      </div>
    );
  }

  // Use profileSlug if exists else fallback to _id
  const profileUrl = userData.profileSlug
    ? `http://localhost:3000/profile/${userData.profileSlug}`
    : `http://localhost:3000/profile/${userData._id}`;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <ToastContainer />

      {/* Header */}
      <div className="bg-white border-2 border-yellow-600 rounded-lg p-6 mb-6 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-yellow-600">Welcome, {userData.name}!</h1>
            <p className="text-gray-600 mt-1">Your email: {userData.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded border border-red-700 hover:bg-red-700 transition-colors"
            type="button"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Customize Profile URL */}
      <div className="bg-white border-2 border-yellow-600 rounded-lg p-6 mb-6 shadow-lg">
        <h3 className="text-lg font-semibold text-yellow-600 mb-4">🔧 Customize Profile URL</h3>

        <form onSubmit={handleSlugUpdate} className="space-y-4" noValidate>
          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
              Choose your custom URL:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                id="slug"
                name="slug"
                placeholder="your-name"
                className="flex-1 px-3 py-2 border-2 border-yellow-600 bg-white placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                required
                pattern="[a-z0-9-]+"
                title="Only lowercase letters, numbers, and hyphens allowed"
                minLength={3}
                maxLength={20}
                autoComplete="off"
              />
              <button
                type="submit"
                disabled={slugLoading}
                className="px-6 py-2 border-2 border-yellow-600 text-yellow-900 bg-yellow-400 hover:bg-yellow-300 font-semibold rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {slugLoading ? 'Updating...' : 'Set URL'}
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Your profile will be available at: <span className="font-mono text-yellow-600">/profile/your-name</span>
            </p>
          </div>

          {slugError && (
            <div className="bg-red-50 border-2 border-red-600 rounded-md p-3" role="alert">
              <p className="text-red-600 text-sm">{slugError}</p>
            </div>
          )}

          {slugSuccess && (
            <div className="bg-green-50 border-2 border-green-600 rounded-md p-3" role="status">
              <p className="text-green-600 text-sm">{slugSuccess}</p>
            </div>
          )}
        </form>
      </div>

      {/* Current Profile Link */}
      <div className="bg-white border-2 border-yellow-600 rounded-lg p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-yellow-600 mb-4">🌐 Your Public Profile</h2>

        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <a
              href={profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline break-all hover:text-blue-800 transition-colors"
            >
              {profileUrl}
            </a>
            <button
              onClick={() => copyToClipboard(profileUrl)}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded border border-blue-700 hover:bg-blue-700 transition-colors"
              type="button"
            >
              Copy Link
            </button>
          </div>

          <div className="text-sm text-gray-600">
            {userData.profileSlug ? (
              <span className="text-green-600">✅ Custom URL is active</span>
            ) : (
              <span className="text-yellow-600">⚠️ Using default URL. Set a custom one above!</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
