'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { useRouter } from 'next/navigation';
import Image from 'next/image'; // Import Next.js Image component
import React from 'react';
import { useAuth } from '@/hooks/useAuth';

// Define interfaces for your data structures to avoid 'any'
interface Book {
  _id: string;
  title: string;
  authors: string[];
  thumbnail?: string;
  status: string; // Use a string if you have many statuses, or a union type if known
  rating?: number;
  tags?: string[];
  categories?: string[];
  endDate?: string; // ISO date string
  startDate?: string; // ISO date string
}

interface Note {
  _id: string;
  content: string;
  updatedAt: string; // ISO date string
}

interface UserProfile { // Renamed from User to UserProfile to avoid conflict with `useAuth` user
  _id: string;
  name: string;
  profileSlug?: string;
  // Add other user properties if they exist
}

// Interface for Recharts Tooltip Payload
interface TooltipPayloadEntry {
  name: string;
  value: number;
  color: string;
  dataKey?: string; // Often useful in tooltips
}


const CHART_COLORS = [
  '#fbbf24', '#f59e0b', '#d97706', '#92400e',
  '#84cc16', '#65a30d', '#16a34a', '#15803d',
  '#06b6d4', '#0891b2', '#0ea5e9', '#0284c7'
];

export default function PublicProfilePage() {
  const { userId } = useParams();
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(''); // Renamed to avoid conflict with catch(error)
  // Statistics related state
  const [statsError, setStatsError] = useState<string | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  // New filter related states
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedTag, setSelectedTag] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Removed 'authUser' as it's not used
  const { loading: authLoading } = useAuth();

  // Fetch profile data
  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      setStatsError(null); // Clear previous stats error
      const res = await fetch(`/api/profile/${userId}`);

      if (!res.ok) {
        if (res.status === 404) {
          setErrorMessage('User not found');
        } else {
          setErrorMessage('Failed to load profile');
        }
        return;
      }

      const data = await res.json();
      setBooks(data.books || []);
      setNotes(data.notes || []);
      setUser(data.user || {});
    } catch (error: unknown) { // Changed 'any' to 'unknown'
      const message = error instanceof Error ? error.message : String(error); // Type narrowing
      setErrorMessage('Failed to load profile: ' + message);
      setStatsError('Failed to load statistics: ' + message);
    } finally {
      setLoading(false);
      setStatsLoading(false);
    }
  }, [userId]); // userId is a dependency here

  useEffect(() => {
    setStatsLoading(true); // Ensure loading state is reset when user ID changes
    fetchProfile();
  }, [userId, fetchProfile]); // Added fetchProfile to dependency array

  // Get all year, tag, status options
  const yearOptions = useMemo(() => {
    const years = new Set<string>();
    books.forEach((book) => {
      if (book.endDate) {
        years.add(new Date(book.endDate).getFullYear().toString());
      }
    });
    return Array.from(years).sort();
  }, [books]);

  const tagOptions = useMemo(() => {
    const tags = new Set<string>();
    books.forEach((book) => {
      (book.tags || []).forEach((t) => tags.add(t));
    });
    return Array.from(tags).sort();
  }, [books]);

  const statusOptions = useMemo(() => {
    const statuses = new Set<string>();
    books.forEach((book) => {
      if (book.status) statuses.add(book.status);
    });
    return Array.from(statuses).sort();
  }, [books]);

  // Filter books based on selected criteria
  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      let match = true;
      if (selectedYear !== 'all') {
        if (!book.endDate || new Date(book.endDate).getFullYear().toString() !== selectedYear) match = false;
      }
      if (selectedTag !== 'all') {
        if (!book.tags || !book.tags.includes(selectedTag)) match = false;
      }
      if (selectedStatus !== 'all') {
        if (book.status !== selectedStatus) match = false;
      }
      return match;
    });
  }, [books, selectedYear, selectedTag, selectedStatus]);

  // Process statistics data (using filteredBooks)
  const chartData = useMemo(() => {
    if (!filteredBooks.length) return {
      monthlyChart: [],
      statusChart: [],
      ratingChart: [],
      tagChart: [],
      catChart: [],
      weeklyChart: []
    };

    // Count finished books by month
    const monthlyData = filteredBooks
      .filter((book) => book.endDate && book.status === 'finished')
      .reduce((acc: Record<string, number>, book) => {
        const month = new Date(book.endDate!).toLocaleString('default', { month: 'short', year: 'numeric' });
        acc[month] = (acc[month] || 0) + 1;
        return acc;
      }, {});
    const monthlyChart = Object.entries(monthlyData)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());

    // Reading status distribution
    const statusData = filteredBooks.reduce((acc: Record<string, number>, book) => {
      acc[book.status] = (acc[book.status] || 0) + 1;
      return acc;
    }, {});
    const statusChart = Object.entries(statusData)
      .map(([status, value]) => ({ status, value }))
      .sort((a, b) => b.value - a.value);

    // Rating distribution
    const ratingData = filteredBooks
      .filter((book) => book.rating && book.rating > 0)
      .reduce((acc: Record<number, number>, book) => {
        const r = Math.floor(book.rating!);
        acc[r] = (acc[r] || 0) + 1;
        return acc;
      }, {});
    const ratingChart = Object.entries(ratingData)
      .map(([rating, count]) => ({ rating: parseInt(rating), count }))
      .sort((a, b) => a.rating - b.rating);

    // Tag frequency
    const tagCounts = filteredBooks.reduce((acc: Record<string, number>, book) => {
      (book.tags || []).forEach((t) => { if (t.trim()) acc[t.trim()] = (acc[t.trim()] || 0) + 1; });
      return acc;
    }, {});
    const tagChart = Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Category distribution
    const catCounts = filteredBooks.reduce((acc: Record<string, number>, book) => {
      (book.categories || []).forEach((c) => { if (c.trim()) acc[c.trim()] = (acc[c.trim()] || 0) + 1; });
      return acc;
    }, {});
    const catChart = Object.entries(catCounts)
      .map(([category, value]) => ({ category, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);

    // Weekly reading activity
    const weekMap: Record<string, number> = {};
    filteredBooks.forEach((book) => {
      if (book.endDate) {
        const d = new Date(book.endDate);
        // ISO week string: yyyy-Www
        const year = d.getFullYear();
        // Calculate week number (simplified for demonstration, consider external library for robust ISO week)
        const dayOfYear = (d.getTime() - new Date(year, 0, 1).getTime()) / 86400000;
        const week = Math.ceil((dayOfYear + 1 + new Date(year, 0, 1).getDay()) / 7);
        const weekStr = `${year}-W${week.toString().padStart(2, '0')}`;
        weekMap[weekStr] = (weekMap[weekStr] || 0) + 1;
      }
    });
    const weeklyChart = Object.entries(weekMap)
      .map(([week, count]) => ({ week, count }))
      .sort((a, b) => a.week.localeCompare(b.week));

    return { monthlyChart, statusChart, ratingChart, tagChart, catChart, weeklyChart };
  }, [filteredBooks]);

  // Updated CustomTooltip to use TooltipPayloadEntry
  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: TooltipPayloadEntry[]; label?: string | number }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border-2 border-yellow-600 rounded shadow-lg">
          <p className="font-semibold text-yellow-600">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // 1. Statistics block card style
  const cardClass = "bg-white rounded-2xl shadow-lg border border-yellow-200 p-8 mb-10";
  // 2. Title block
  const sectionTitle = (
    <div className="mb-8 text-center">
      <h2 className="text-3xl font-extrabold text-yellow-600 flex items-center justify-center gap-2">
        <span>📊</span> Reading Statistics
      </h2>
      <p className="text-gray-500 mt-2 text-base">Visualize your reading habits and trends. Use the filters to explore your data!</p>
    </div>
  );

  if (authLoading || loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
          <span className="ml-3 text-gray-600">Loading profile...</span>
        </div>
      </div>
    );
  }

  // Check if user is null or undefined (after loading)
  if (!user || !user._id) { // Check user._id as well, as user might be an empty object {}
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-red-50 border-2 border-red-600 rounded-lg p-6 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Profile Not Found</h1>
          <p className="text-red-500">The requested user profile could not be found or you need to log in.</p>
          {errorMessage && <p className="text-red-500 mt-2">{errorMessage}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white border-2 border-yellow-600 rounded-lg p-6 mb-6 shadow-lg">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-yellow-600 border-2 border-yellow-800 flex items-center justify-center">
            <span className="text-yellow-900 text-2xl">👤</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-yellow-600">
              {user?.name || 'Unknown User'}&apos;s Profile
            </h1>
            {user?.profileSlug && (
              <p className="text-gray-600 text-sm">
                Custom URL: <span className="font-mono text-yellow-600">/profile/{user.profileSlug}</span>
              </p>
            )}
          </div>
        </div>
      </div>
      {/* Go to My Page button */}
      <div className="mb-6 flex justify-end">
        <button
          className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
          onClick={() => router.push('/me')}
        >
          Go to My Personal Page
        </button>
      </div>
      {/* Shared Books */}
      {books.length > 0 && (
        <section className="bg-white border-2 border-yellow-600 rounded-lg p-6 mb-6 shadow-lg">
          <h2 className="text-xl font-semibold text-yellow-600 mb-4">📚 Shared Books ({books.length})</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {books.map((book) => (
              <div key={book._id} className="border-2 border-yellow-600 p-3 rounded-lg hover:border-yellow-400 transition-colors">
                {book.thumbnail && (
                  <Image src={book.thumbnail} alt={book.title} width={100} height={150} layout="responsive" className="mb-2 rounded" />
                )}
                <h3 className="font-bold text-sm text-gray-800">{book.title}</h3>
                <p className="text-xs text-gray-600">{(book.authors || []).join(', ')}</p>
                <p className="text-xs text-yellow-600 font-semibold">Status: {book.status}</p>
                {book.rating && (
                  <p className="text-xs text-gray-500">⭐ {book.rating}/5</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Reading Statistics Section */}
      <div className="mt-12">
        {sectionTitle}
        {/* Filter interactions */}
        <div className="flex flex-wrap gap-6 mb-10 justify-center">
          <div>
            <label htmlFor="year-select" className="block text-sm font-semibold mb-1 text-gray-700">Year</label>
            <select id="year-select" className="border-2 border-yellow-400 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-400" value={selectedYear} onChange={e => setSelectedYear(e.target.value)}>
              <option value="all">All</option>
              {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="tag-select" className="block text-sm font-semibold mb-1 text-gray-700">Tag</label>
            <select id="tag-select" className="border-2 border-yellow-400 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-400" value={selectedTag} onChange={e => setSelectedTag(e.target.value)}>
              <option value="all">All</option>
              {tagOptions.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="status-select" className="block text-sm font-semibold mb-1 text-gray-700">Status</label>
            <select id="status-select" className="border-2 border-yellow-400 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-400" value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)}>
              <option value="all">All</option>
              {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
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
        ) : !filteredBooks.length ? (
          <div className={cardClass + " text-center"}>
            <p className="text-gray-600 text-lg">No books found. Start adding books to see your reading statistics!</p>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Monthly Reading Count - BarChart */}
            <div className={cardClass}>
              <h3 className="text-lg font-bold mb-4 text-yellow-600 flex items-center gap-2">📅 Monthly Reading Count</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData.monthlyChart}>
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} angle={-30} textAnchor="end" height={60} />
                  <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="count" fill="#fbbf24" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            {/* Reading Status Distribution - PieChart */}
            <div className={cardClass}>
              <h3 className="text-lg font-bold mb-4 text-yellow-600 flex items-center gap-2">📖 Reading Status Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData.statusChart}
                    dataKey="value"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={110}
                    fill="#8884d8"
                    label
                  >
                    {chartData.statusChart.map((entry, index) => (
                      <Cell key={`cell-status-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Rating Distribution - BarChart */}
            <div className={cardClass}>
              <h3 className="text-lg font-bold mb-4 text-yellow-600 flex items-center gap-2">⭐ Rating Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData.ratingChart}>
                  <XAxis dataKey="rating" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="count" fill="#84cc16" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            {/* Tag Frequency - PieChart */}
            <div className={cardClass}>
              <h3 className="text-lg font-bold mb-4 text-yellow-600 flex items-center gap-2">🏷️ Tag Frequency</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData.tagChart}
                    dataKey="count"
                    nameKey="tag"
                    cx="50%"
                    cy="50%"
                    outerRadius={110}
                    fill="#f59e0b"
                    label
                  >
                    {chartData.tagChart.map((entry, index) => (
                      <Cell key={`cell-tag-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Category Distribution - PieChart */}
            <div className={cardClass}>
              <h3 className="text-lg font-bold mb-4 text-yellow-600 flex items-center gap-2">📚 Category Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData.catChart}
                    dataKey="value"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={110}
                    fill="#06b6d4"
                    label
                  >
                    {chartData.catChart.map((entry, index) => (
                      <Cell key={`cell-cat-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Weekly Reading Activity - LineChart with gradient fill */}
            <div className={cardClass}>
              <h3 className="text-lg font-bold mb-4 text-yellow-600 flex items-center gap-2">📈 Weekly Reading Activity</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData.weeklyChart}>
                  <defs>
                    <linearGradient id="colorLine" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="week" tick={{ fontSize: 10 }} interval={Math.ceil(chartData.weeklyChart.length / 10)} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line type="monotone" dataKey="count" stroke="#0ea5e9" strokeWidth={2} fill="url(#colorLine)" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Shared Notes */}
      {notes.length > 0 && (
        <section className="bg-white border-2 border-yellow-600 rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-yellow-600 mb-4">📝 Shared Notes ({notes.length})</h2>
          <div className="space-y-4">
            {notes.map((note) => (
              <div key={note._id} className="bg-gray-50 border border-yellow-600 p-4 rounded-lg">
                <p className="text-sm whitespace-pre-line text-gray-800">{note.content}</p>
                <p className="text-xs text-gray-500 mt-2">
                  Last updated: {new Date(note.updatedAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Empty State */}
      {books.length === 0 && notes.length === 0 && (
        <div className="bg-white border-2 border-yellow-600 rounded-lg p-8 text-center shadow-lg">
          <div className="w-16 h-16 bg-yellow-600 border-2 border-yellow-800 flex items-center justify-center mx-auto mb-4">
            <span className="text-yellow-900 text-2xl">📚</span>
          </div>
          <h3 className="text-lg font-semibold text-yellow-600 mb-2">No Public Content</h3>
          <p className="text-gray-600">
            This user hasn&apos;t shared any books or notes publicly yet.
          </p>
        </div>
      )}
    </div>
  );
}