'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

// Define an interface for your Book data
interface Book {
  endDate?: string; // Optional, as not all books will have an endDate
  status: string;
  rating?: number; // Optional
  tags?: string[]; // Optional
  categories?: string[]; // Optional
  // Add other properties of a book if they exist, e.g.,
  // title: string;
  // author: string;
  // _id: string;
}

// Define an interface for the CustomTooltip props
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number | string;
    color: string;
  }>;
  label?: string | number;
}


function validatePassword(password: string) {
  return password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /\d/.test(password) &&
    /[!@#$%^&*(),.?":{}|<>]/.test(password);
}

export default function MyProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // 更改密码表单状态
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  // 更改邮箱表单状态
  const [newEmail, setNewEmail] = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [emailSuccess, setEmailSuccess] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);

  // 更改用户名表单状态
  const [newUsername, setNewUsername] = useState('');
  const [usernamePassword, setUsernamePassword] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [usernameSuccess, setUsernameSuccess] = useState('');
  const [usernameLoading, setUsernameLoading] = useState(false);

  // 统计相关状态
  const [books, setBooks] = useState<Book[]>([]); // **FIXED: Use Book[]**
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!loading && user) {
      // 获取当前用户所有书籍
      const fetchBooks = async () => {
        try {
          setStatsLoading(true);
          setStatsError(null);
          const response = await fetch('/api/books');
          const data = await response.json();
          if (!response.ok) throw new Error(data.error || 'Failed to fetch books');
          setBooks(data);
        } catch (err) {
          setStatsError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
          setStatsLoading(false);
        }
      };
      fetchBooks();
    }
  }, [loading, user]);

  // 统计数据处理（复用 stats/page.tsx 的 useMemo 逻辑）
  const chartData = useMemo(() => {
    if (!books.length) return {
      monthlyChart: [],
      statusChart: [],
      ratingChart: [],
      tagChart: [],
      catChart: []
    };
    // Count finished books by month
    const monthlyData = books
      .filter((book: Book) => book.endDate && book.status === 'finished') // **FIXED: Use Book**
      .reduce((acc: Record<string, number>, book: Book) => { // **FIXED: Use Book**
        const month = new Date(book.endDate!).toLocaleString('default', { month: 'short', year: 'numeric' });
        acc[month] = (acc[month] || 0) + 1;
        return acc;
      }, {});
    const monthlyChart = Object.entries(monthlyData)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());
    // Reading status distribution
    const statusData = books.reduce((acc: Record<string, number>, book: Book) => { // **FIXED: Use Book**
      acc[book.status] = (acc[book.status] || 0) + 1;
      return acc;
    }, {});
    const statusChart = Object.entries(statusData)
      .map(([status, value]) => ({ status, value }))
      .sort((a, b) => b.value - a.value);
    // Rating distribution
    const ratingData = books
      .filter((book: Book) => book.rating && book.rating > 0) // **FIXED: Use Book**
      .reduce((acc: Record<number, number>, book: Book) => { // **FIXED: Use Book**
        const r = Math.floor(book.rating!);
        acc[r] = (acc[r] || 0) + 1;
        return acc;
      }, {});
    const ratingChart = Object.entries(ratingData)
      .map(([rating, count]) => ({ rating: parseInt(rating), count }))
      .sort((a, b) => a.rating - b.rating);
    // Tag frequency
    const tagCounts = books.reduce((acc: Record<string, number>, book: Book) => { // **FIXED: Use Book**
      (book.tags || []).forEach((t: string) => { if (t.trim()) acc[t.trim()] = (acc[t.trim()] || 0) + 1; });
      return acc;
    }, {});
    const tagChart = Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    // Category distribution
    const catCounts = books.reduce((acc: Record<string, number>, book: Book) => { // **FIXED: Use Book**
      (book.categories || []).forEach((c: string) => { if (c.trim()) acc[c.trim()] = (acc[c.trim()] || 0) + 1; });
      return acc;
    }, {});
    const catChart = Object.entries(catCounts)
      .map(([category, value]) => ({ category, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
    return { monthlyChart, statusChart, ratingChart, tagChart, catChart };
  }, [books]);
  const colors = [
    '#fbbf24', '#f59e0b', '#d97706', '#92400e',
    '#84cc16', '#65a30d', '#16a34a', '#15803d',
    '#06b6d4', '#0891b2', '#0ea5e9', '#0284c7'
  ];
  const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => { // **FIXED: Use CustomTooltipProps**
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border-2 border-yellow-600 rounded shadow-lg">
          <p className="font-semibold text-yellow-600">{label}</p>
          {payload.map((entry, index: number) => ( // Removed `any` from entry, infer type from CustomTooltipProps
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // 更改密码提交
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError('');
    setPwSuccess('');
    if (!oldPassword || !newPassword || !confirmPassword) {
      setPwError('All fields are required');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError('New passwords do not match');
      return;
    }
    if (!validatePassword(newPassword)) {
      setPwError('Password must be at least 8 characters and include uppercase, lowercase, number, and special character');
      return;
    }
    setPwLoading(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldPassword, newPassword })
      });
      const data = await res.json();
      if (res.ok) {
        setPwSuccess('Password updated successfully!');
        setOldPassword(''); setNewPassword(''); setConfirmPassword('');
      } else {
        setPwError(data.error || 'Failed to update password');
      }
    } catch {
      setPwError('Network error');
    } finally {
      setPwLoading(false);
    }
  };

  // 更改邮箱提交
  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');
    setEmailSuccess('');
    if (!newEmail || !emailPassword) {
      setEmailError('All fields are required');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      setEmailError('Invalid email format');
      return;
    }
    setEmailLoading(true);
    try {
      const res = await fetch('/api/auth/change-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newEmail, password: emailPassword })
      });
      const data = await res.json();
      if (res.ok) {
        setEmailSuccess('Email updated successfully! Please re-login.');
        setNewEmail(''); setEmailPassword('');
        setTimeout(() => { window.location.href = '/login'; }, 2000);
      } else {
        setEmailError(data.error || 'Failed to update email');
      }
    } catch {
      setEmailError('Network error');
    } finally {
      setEmailLoading(false);
    }
  };

  // 更改用户名提交
  const handleChangeUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    setUsernameError('');
    setUsernameSuccess('');
    if (!newUsername || !usernamePassword) {
      setUsernameError('All fields are required');
      return;
    }
    if (newUsername.length < 3 || newUsername.length > 20) {
      setUsernameError('Username must be between 3 and 20 characters');
      return;
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(newUsername)) {
      setUsernameError('Username can only contain letters, numbers, underscores, and hyphens');
      return;
    }
    setUsernameLoading(true);
    try {
      const res = await fetch('/api/auth/change-username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newUsername, password: usernamePassword })
      });
      const data = await res.json();
      if (res.ok) {
        setUsernameSuccess('Username updated successfully!');
        setNewUsername(''); setUsernamePassword('');
        // 刷新页面以更新用户信息
        setTimeout(() => { window.location.reload(); }, 1500);
      } else {
        setUsernameError(data.error || 'Failed to update username');
      }
    } catch {
      setUsernameError('Network error');
    } finally {
      setUsernameLoading(false);
    }
  };

  // 页面顶部添加返回按钮
  let publicProfileUrl = '';
  if (user) {
    publicProfileUrl = user.profileSlug ? `/profile/${user.profileSlug}` : `/profile/${user._id}`;
  }

  if (loading) {
    return (
      <div className="p-6 max-w-xl mx-auto">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3">Loading profile...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Redirect already handled in useEffect
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Back to My Public Page 按钮 */}
      <div className="mb-6 flex justify-end">
        <button
          className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
          onClick={() => router.push(publicProfileUrl)}
          disabled={!publicProfileUrl}
        >
          Back to My Public Page
        </button>
      </div>
      <h1 className="text-2xl font-bold mb-6">👤 My Profile</h1>
      <div className="bg-white rounded-lg shadow-sm border p-6 space-y-4">
        <div className="flex items-center space-x-4">
          {/* {user.image && (
            <img src={user.image} alt="Avatar" className="w-20 h-20 rounded-full" />
          )} */}
          <div>
            <h2 className="text-xl font-semibold">{user.name || 'N/A'}</h2>
            <p className="text-gray-600">{user.email}</p>
          </div>
        </div>
        <div className="border-t pt-4 space-y-3">
          <div className="flex justify-between">
            <span className="font-medium">Name:</span>
            <span>{user.name || 'Not set'}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Username:</span>
            <span>{user.username || 'Not set'}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Email:</span>
            <span>{user.email}</span>
          </div>
          {user.profileSlug && (
            <div className="flex justify-between">
              <span className="font-medium">Profile Slug:</span>
              <span className="text-blue-600">{user.profileSlug}</span>
            </div>
          )}
        </div>
        <div className="border-t pt-4">
          <h3 className="font-semibold mb-2">Profile URL</h3>
          <p className="text-sm text-gray-600">
            Your public profile: <span className="text-blue-600">/profile/{user.profileSlug || 'your-slug'}</span>
          </p>
        </div>
      </div>

      {/* 更改密码表单 */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mt-8">
        <h2 className="text-lg font-bold mb-4 text-yellow-600">Change Password</h2>
        <form className="space-y-4" onSubmit={handleChangePassword}>
          <div>
            <label className="block text-sm font-medium mb-1">Current Password</label>
            <input type="password" className="w-full border-2 border-yellow-600 rounded px-3 py-2" value={oldPassword} onChange={e => setOldPassword(e.target.value)} required autoComplete="current-password" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">New Password</label>
            <input type="password" className="w-full border-2 border-yellow-600 rounded px-3 py-2" value={newPassword} onChange={e => setNewPassword(e.target.value)} required autoComplete="new-password" />
            <p className="text-xs text-gray-500 mt-1">At least 8 chars, upper/lowercase, number, special char</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Confirm New Password</label>
            <input type="password" className="w-full border-2 border-yellow-600 rounded px-3 py-2" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required autoComplete="new-password" />
          </div>
          {pwError && <div className="bg-red-50 border-2 border-red-600 rounded-md p-3"><p className="text-red-600 text-sm">{pwError}</p></div>}
          {pwSuccess && <div className="bg-green-50 border-2 border-green-600 rounded-md p-3"><p className="text-green-600 text-sm">{pwSuccess}</p></div>}
          <button type="submit" disabled={pwLoading} className="w-full py-2 bg-yellow-600 text-white font-semibold rounded border-2 border-yellow-700 hover:bg-yellow-700 transition-colors disabled:opacity-50">{pwLoading ? 'Updating...' : 'Update Password'}</button>
        </form>
      </div>

      {/* 更改邮箱表单 */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mt-8">
        <h2 className="text-lg font-bold mb-4 text-yellow-600">Change Email</h2>
        <form className="space-y-4" onSubmit={handleChangeEmail}>
          <div>
            <label className="block text-sm font-medium mb-1">New Email</label>
            <input type="email" className="w-full border-2 border-yellow-600 rounded px-3 py-2" value={newEmail} onChange={e => setNewEmail(e.target.value)} required autoComplete="email" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Current Password</label>
            <input type="password" className="w-full border-2 border-yellow-600 rounded px-3 py-2" value={emailPassword} onChange={e => setEmailPassword(e.target.value)} required autoComplete="current-password" />
          </div>
          {emailError && <div className="bg-red-50 border-2 border-red-600 rounded-md p-3"><p className="text-red-600 text-sm">{emailError}</p></div>}
          {emailSuccess && <div className="bg-green-50 border-2 border-green-600 rounded-md p-3"><p className="text-green-600 text-sm">{emailSuccess}</p></div>}
          <button type="submit" disabled={emailLoading} className="w-full py-2 bg-yellow-600 text-white font-semibold rounded border-2 border-yellow-700 hover:bg-yellow-700 transition-colors disabled:opacity-50">{emailLoading ? 'Updating...' : 'Update Email'}</button>
        </form>
      </div>

      {/* 更改用户名表单 */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mt-8">
        <h2 className="text-lg font-bold mb-4 text-yellow-600">Change Username</h2>
        <form className="space-y-4" onSubmit={handleChangeUsername}>
          <div>
            <label className="block text-sm font-medium mb-1">New Username</label>
            <input type="text" className="w-full border-2 border-yellow-600 rounded px-3 py-2" value={newUsername} onChange={e => setNewUsername(e.target.value)} required />
            <p className="text-xs text-gray-500 mt-1">3-20 characters, letters, numbers, underscores, hyphens</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Current Password</label>
            <input type="password" className="w-full border-2 border-yellow-600 rounded px-3 py-2" value={usernamePassword} onChange={e => setUsernamePassword(e.target.value)} required autoComplete="current-password" />
          </div>
          {usernameError && <div className="bg-red-50 border-2 border-red-600 rounded-md p-3"><p className="text-red-600 text-sm">{usernameError}</p></div>}
          {usernameSuccess && <div className="bg-green-50 border-2 border-green-600 rounded-md p-3"><p className="text-green-600 text-sm">{usernameSuccess}</p></div>}
          <button type="submit" disabled={usernameLoading} className="w-full py-2 bg-yellow-600 text-white font-semibold rounded border-2 border-yellow-700 hover:bg-yellow-700 transition-colors disabled:opacity-50">{usernameLoading ? 'Updating...' : 'Update Username'}</button>
        </form>
      </div>

      {/* 统计区块 */}
      {false && (
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6 text-yellow-600">📊 My Reading Statistics</h2>
        {statsLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
            <span className="ml-3 text-gray-600">Loading statistics...</span>
          </div>
        ) : statsError ? (
          <div className="bg-red-50 border-2 border-red-600 rounded-lg p-4">
            <h2 className="text-red-600 font-semibold">Error Loading Statistics</h2>
            <p className="text-red-500">{statsError}</p>
          </div>
        ) : !books.length ? (
          <div className="bg-white border-2 border-yellow-600 rounded-lg p-8 text-center shadow-lg">
            <p className="text-gray-600 text-lg">No books found. Start adding books to see your reading statistics!</p>
          </div>
        ) : (
          <div className="space-y-12">
            {/* 复用原 stats/page.tsx 的统计区块 */}
            {/* Monthly Reading Count */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-bold mb-4 text-yellow-600">Monthly Reading Count</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData.monthlyChart}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="count" fill="#fbbf24" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Reading Status Distribution */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-bold mb-4 text-yellow-600">Reading Status Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData.statusChart}
                    dataKey="value"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={150}
                    fill="#8884d8"
                    label
                  >
                    {chartData.statusChart.map((entry, index) => (
                      <Cell key={`cell-status-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Rating Distribution */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-bold mb-4 text-yellow-600">Rating Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData.ratingChart}>
                  <XAxis dataKey="rating" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="count" fill="#84cc16" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Tag Frequency */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-bold mb-4 text-yellow-600">Tag Frequency</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData.tagChart}
                    dataKey="count"
                    nameKey="tag"
                    cx="50%"
                    cy="50%"
                    outerRadius={150}
                    fill="#f59e0b"
                    label
                  >
                    {chartData.tagChart.map((entry, index) => (
                      <Cell key={`cell-tag-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Category Distribution */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-bold mb-4 text-yellow-600">Category Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData.catChart}
                    dataKey="value"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={150}
                    fill="#06b6d4"
                    label
                  >
                    {chartData.catChart.map((entry, index) => (
                      <Cell key={`cell-cat-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
      )}
    </div>
  );
}