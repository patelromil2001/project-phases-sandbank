'use client';

import { useEffect, useState, useMemo } from 'react';
import ReactDOM from 'react-dom';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY!;

interface Book {
  _id?: string;
  id?: string;
  googleId?: string;
  title: string;
  authors?: string[];
  thumbnail?: string;
  volumeInfo?: {
    imageLinks?: { thumbnail?: string };
    title: string;
    authors?: string[];
    categories?: string[];
    notes?: string;
  };
  categories?: string[];
  notes?: string;
  status?: 'finished' | 'reading' | 'wishlist' | 'abandoned';
  rating?: number | string;
  tags?: string[];
  startDate?: string;
  endDate?: string;
}

export default function BookListPage() {
  const { user, loading } = useAuth();
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Book[]>([]);
  const [myBooks, setMyBooks] = useState<Book[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [refreshFlag, setRefreshFlag] = useState(0);

  const stats = useMemo(() => {
    const total = myBooks.length;
    const finished = myBooks.filter((b) => b.status === 'finished').length;
    const reading = myBooks.filter((b) => b.status === 'reading').length;
    const wishlist = myBooks.filter((b) => b.status === 'wishlist').length;
    const abandoned = myBooks.filter((b) => b.status === 'abandoned').length;
    return { total, finished, reading, wishlist, abandoned };
  }, [myBooks]);

  const filteredBooks = useMemo(() => {
    return myBooks.filter((book) => {
      const matchStatus = statusFilter === 'all' || book.status === statusFilter;
      const matchQuery =
        !query ||
        book.title.toLowerCase().includes(query.toLowerCase()) ||
        (book.authors && book.authors.join(',').toLowerCase().includes(query.toLowerCase()));
      return matchStatus && matchQuery;
    });
  }, [myBooks, statusFilter, query]);

  const fetchMyBooks = async () => {
    try {
      const res = await fetch('/api/books');
      if (res.ok) {
        const data = await res.json();
        setMyBooks(data);
      } else {
        const err = await res.json();
        toast.error('Failed to load books: ' + (err.error || res.statusText));
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      toast.error('Network error while loading books: ' + msg);
    }
  };

  useEffect(() => {
    fetchMyBooks();
  }, [refreshFlag]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${query}&key=${GOOGLE_API_KEY}`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.items || []);
      } else {
        const err = await res.json();
        toast.error('Search failed: ' + (err.error || res.statusText));
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      toast.error('Network error during search: ' + msg);
    }
  };

  const handleAdd = async (book: Book) => {
    const payload = {
      googleId: book.id,
      title: book.volumeInfo?.title || book.title,
      authors: book.volumeInfo?.authors || book.authors || [],
      thumbnail: book.volumeInfo?.imageLinks?.thumbnail || book.thumbnail || '',
      categories: book.volumeInfo?.categories || book.categories || [],
      notes: book.volumeInfo?.notes || book.notes || '',
    };
    try {
      const res = await fetch('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const createdBook = await res.json();

        if (payload.notes && payload.notes.trim()) {
          try {
            await fetch('/api/notes', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ bookId: createdBook._id, content: payload.notes }),
            });
          } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : String(e);
            toast.error('Error syncing notes: ' + msg);
          }
        }

        await fetchMyBooks();
        toast.success('Book added!');
      } else {
        const err = await res.json();
        toast.error('Failed to add book: ' + (err.error || res.statusText));
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      toast.error('Network error while adding book: ' + msg);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
          <span className="ml-3 text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-red-50 border-2 border-red-600 rounded-lg p-6 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">You need to log in to access this page</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />

      {/* Stats section */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <StatCard label="Total" value={stats.total} color="bg-yellow-400" />
        <StatCard label="Finished" value={stats.finished} color="bg-green-400" />
        <StatCard label="Reading" value={stats.reading} color="bg-blue-400" />
        <StatCard label="Wishlist" value={stats.wishlist} color="bg-gray-200" />
        <StatCard label="Abandoned" value={stats.abandoned} color="bg-red-300" />
      </div>

      {/* Search & filter form */}
      <form onSubmit={handleSearch} className="mb-6 flex flex-wrap gap-2 items-center">
        <input
          className="border-2 border-yellow-400 rounded-lg px-3 py-2 w-full md:w-1/2"
          type="text"
          placeholder="Search books by title or author..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          className="border-2 border-yellow-400 rounded-lg px-3 py-2"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="finished">Finished</option>
          <option value="reading">Reading</option>
          <option value="wishlist">Wishlist</option>
          <option value="abandoned">Abandoned</option>
        </select>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Search
        </button>
      </form>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Search Results</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {searchResults.map((book) => (
              <BookCard key={book.id || book._id} book={book} onAdd={handleAdd} />
            ))}
          </div>
        </div>
      )}

      {/* My Books */}
      <h2 className="text-xl font-semibold mb-2">Your Library</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {filteredBooks.length === 0 ? (
          <div className="col-span-full text-center text-gray-500 py-12">No books found.</div>
        ) : (
          filteredBooks.map((book) => (
            <BookCard key={book._id} book={book} onView={() => setSelectedBook(book)} />
          ))
        )}
      </div>

      {/* Book Detail Modal */}
      {selectedBook && (
        <BookDetailModal
          book={selectedBook}
          onClose={() => setSelectedBook(null)}
          onUpdated={() => {
            setSelectedBook(null);
            setRefreshFlag((f) => f + 1);
          }}
        />
      )}
    </div>
  );
}

// Stats card component
function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className={`rounded-xl shadow-md p-4 flex flex-col items-center ${color}`}>
      <span className="text-lg font-bold text-gray-800">{label}</span>
      <span className="text-2xl font-extrabold text-gray-900">{value}</span>
    </div>
  );
}

// Book card component with optional onAdd and onView callbacks
function BookCard({ book, onAdd, onView }: { book: Book; onAdd?: (book: Book) => void; onView?: () => void }) {
  // Determine appropriate alt text for the image
  const imageAltText = book.title ? `Cover image for the book "${book.title}"` : 'Book cover image';

  return (
    <div className="bg-white rounded-xl shadow-md border border-yellow-100 p-4 flex flex-col hover:shadow-lg transition-shadow">
      <Image
        src={
          book.thumbnail ||
          book.volumeInfo?.imageLinks?.thumbnail ||
          '/file.svg'
        }
        alt={imageAltText} // Added alt prop here
        width={222}
        height={222}
        className="object-contain mb-2 rounded"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.src = '/file.svg';
        }}
      />
      <h3 className="font-bold text-base mb-1 truncate" title={book.title}>
        {book.title}
      </h3>
      <p className="text-xs text-gray-600 mb-1 truncate">{(book.authors || []).join(', ')}</p>
      {book.status && (
        <span className="inline-block text-xs px-2 py-1 rounded bg-yellow-100 text-yellow-700 mb-1">{book.status}</span>
      )}
      {book.rating && (
        <span className="inline-block text-xs px-2 py-1 rounded bg-green-100 text-green-700 mb-1">
          ⭐ {book.rating}/5
        </span>
      )}
      {onAdd ? (
        <button
          onClick={() => {
            onAdd(book);
          }}
          className="mt-2 bg-green-600 text-white px-2 py-1 text-sm rounded hover:bg-green-700"
        >
          Add
        </button>
      ) : (
        <button
          onClick={onView}
          className="inline-block mt-2 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
        >
          View
        </button>
      )}
    </div>
  );
}

// Book detail modal component with edit and delete functionality
function BookDetailModal({
  book,
  onClose,
  onUpdated,
}: {
  book: Book;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({
    status: book.status || '',
    rating: book.rating?.toString() || '',
    tags: (book.tags || []).join(', '),
    notes: book.notes || '',
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  // Prevent modal from closing on click inside
  const stop = (e: React.MouseEvent) => e.stopPropagation();

  // Save book updates
  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`/api/books/${book._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: form.status,
          rating: form.rating ? Number(form.rating) : undefined,
          tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
          notes: form.notes,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        const msg = 'Failed to update book: ' + (err.error || res.statusText);
        setError(msg);
        toast.error(msg);
        setSaving(false);
        return;
      }

      // Sync notes
      try {
        const notesRes = await fetch('/api/notes');
        const notesData = await notesRes.json();
        const myNote = notesData.find((n: { bookId: string }) => n.bookId === book._id);

        if (form.notes && form.notes.trim()) {
          if (myNote) {
            await fetch(`/api/notes/${myNote._id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ content: form.notes }),
            });
          } else {
            await fetch('/api/notes', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ bookId: book._id, content: form.notes }),
            });
          }
        } else if (myNote) {
          await fetch(`/api/notes/${myNote._id}`, { method: 'DELETE' });
        }
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        toast.error('Error syncing notes: ' + msg);
      }

      toast.success('Book updated!');
      onUpdated();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError('Network error while saving book: ' + msg);
      toast.error('Network error while saving book: ' + msg);
    } finally {
      setSaving(false);
    }
  };

  // Delete book
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this book?')) return;

    setDeleting(true);
    setError('');
    try {
      const res = await fetch(`/api/books/${book._id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Book deleted!');
        onUpdated();
      } else {
        const err = await res.json();
        const msg = 'Failed to delete book: ' + (err.error || res.statusText);
        setError(msg);
        toast.error(msg);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError('Network error while deleting book: ' + msg);
      toast.error('Network error while deleting book: ' + msg);
    } finally {
      setDeleting(false);
    }
  };

  // Determine appropriate alt text for the image in the modal
  const imageAltText = book.title ? `Cover image for "${book.title}"` : 'Book cover image';

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative" onClick={stop}>
        <button className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-2xl" onClick={onClose}>
          &times;
        </button>
        <Image
          src={book.thumbnail || '/file.svg'}
          alt={imageAltText} // Added alt prop here
          width={160}
          height={160}
          className="object-contain mx-auto mb-4 rounded"
        />
        <h2 className="text-2xl font-bold text-yellow-700 mb-2 text-center">{book.title}</h2>
        <p className="text-center text-gray-600 mb-2">{(book.authors || []).join(', ')}</p>

        {edit ? (
          <form className="space-y-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Status</label>
              <select
                className="w-full border-2 border-yellow-400 rounded px-2 py-1"
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
              >
                <option value="wishlist">Wishlist</option>
                <option value="reading">Reading</option>
                <option value="finished">Finished</option>
                <option value="abandoned">Abandoned</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Rating</label>
              <input
                type="number"
                min={1}
                max={5}
                step={1}
                className="w-full border-2 border-yellow-400 rounded px-2 py-1"
                value={form.rating}
                onChange={(e) => setForm((f) => ({ ...f, rating: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Tags (comma separated)</label>
              <input
                type="text"
                className="w-full border-2 border-yellow-400 rounded px-2 py-1"
                value={form.tags}
                onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Notes</label>
              <textarea
                rows={3}
                className="w-full border-2 border-yellow-400 rounded px-2 py-1"
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              />
            </div>
            {error && <p className="text-red-500 text-xs">{error}</p>}
            <div className="flex justify-between mt-4">
              <button
                type="button"
                disabled={saving}
                onClick={() => {
                  setEdit(false);
                  setError('');
                  setForm({
                    status: book.status || '',
                    rating: book.rating?.toString() || '',
                    tags: (book.tags || []).join(', '),
                    notes: book.notes || '',
                  });
                }}
                className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={handleSave}
                className="px-4 py-2 rounded bg-yellow-600 text-white hover:bg-yellow-700"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        ) : (
          <>
            <p className="text-xs text-gray-500 mb-2">
              <span className="font-semibold">Status:</span> {book.status || 'N/A'}
            </p>
            <p className="text-xs text-gray-500 mb-2">
              <span className="font-semibold">Rating:</span> {book.rating || 'N/A'}
            </p>
            <p className="text-xs text-gray-500 mb-2">
              <span className="font-semibold">Tags:</span> {(book.tags || []).join(', ') || 'N/A'}
            </p>
            <p className="text-xs text-gray-500 mb-4 whitespace-pre-wrap">{book.notes || 'No notes'}</p>
            <div className="flex justify-between">
              <button
                onClick={() => setEdit(true)}
                className="px-4 py-2 rounded bg-yellow-600 text-white hover:bg-yellow-700"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}