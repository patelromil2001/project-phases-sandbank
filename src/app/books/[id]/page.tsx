'use client';

import { useEffect, useState, useCallback, FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Book {
  _id: string;
  title: string;
  authors: string[];
  thumbnail: string;
  status?: string;
  rating?: number | string;
  tags?: string[];
  startDate?: string;
  endDate?: string;
  isPublic?: boolean;
}

interface Note {
  bookId: string | string[];
  _id: string;
  content: string;
  updatedAt: string;
  isPublic?: boolean;
}

interface FormState {
  status: string;
  rating: string;
  tags: string;
  startDate: string;
  endDate: string;
}

export default function BookDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [book, setBook] = useState<Book | null>(null);
  const [form, setForm] = useState<FormState>({
    status: 'wishlist',
    rating: '',
    tags: '',
    startDate: '',
    endDate: '',
  });
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState('');
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  // Memoize fetchNotes to prevent re-creation on each render
  const fetchNotes = useCallback(async () => {
    if (!id) return;
    try {
      const res = await fetch('/api/notes');
      if (!res.ok) throw new Error('Failed to fetch notes');
      const data: Note[] = await res.json();
      setNotes(data.filter((n) => n.bookId === id));
    } catch (error) {
      toast.error((error as Error).message || 'Failed to load notes');
    }
  }, [id]);

  useEffect(() => {
    if (!id) return;

    async function fetchBookAndNotes() {
      try {
        const bookRes = await fetch(`/api/books/${id}`);
        if (!bookRes.ok) throw new Error('Failed to load book');
        const bookData: Book = await bookRes.json();
        setBook(bookData);
        setForm({
          status: bookData.status || 'wishlist',
          rating: bookData.rating ? String(bookData.rating) : '',
          tags: bookData.tags ? bookData.tags.join(', ') : '',
          startDate: bookData.startDate ? bookData.startDate.slice(0, 10) : '',
          endDate: bookData.endDate ? bookData.endDate.slice(0, 10) : '',
        });

        await fetchNotes();
      } catch (error) {
        toast.error((error as Error).message || 'Failed to fetch data');
      }
    }

    fetchBookAndNotes();
  }, [id, fetchNotes]); // Add fetchNotes here

  // rest of your handlers...

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!id) return;

    const updates = {
      ...form,
      tags: form.tags.split(',').map((t) => t.trim()),
      rating: form.rating ? Number(form.rating) : '',
    };

    try {
      const res = await fetch(`/api/books/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        toast.success('✅ Book updated!');
      } else {
        toast.error('❌ Failed to update book.');
      }
    } catch {
      toast.error('❌ Failed to update book.');
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      const res = await fetch(`/api/books/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('📚 Book deleted!');
        router.push('/books');
      } else {
        toast.error('❌ Failed to delete book.');
      }
    } catch {
      toast.error('❌ Failed to delete book.');
    }
  };

  const handleNoteSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!id) return;
    const url = editingNote ? `/api/notes/${editingNote._id}` : '/api/notes';
    const method = editingNote ? 'PUT' : 'POST';
    const body = editingNote ? { content: newNote } : { bookId: id, content: newNote };

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        toast.success(editingNote ? '✏️ Note updated!' : '📝 Note added!');
        setNewNote('');
        setEditingNote(null);
        await fetchNotes();
      } else {
        toast.error('❌ Failed to save note');
      }
    } catch {
      toast.error('❌ Failed to save note');
    }
  };

  const handleEdit = (note: Note) => {
    setNewNote(note.content);
    setEditingNote(note);
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      const res = await fetch(`/api/notes/${noteId}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('🗑️ Note deleted!');
        await fetchNotes();
      } else {
        toast.error('❌ Failed to delete note');
      }
    } catch {
      toast.error('❌ Failed to delete note');
    }
  };

  if (!book) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-xl mx-auto">
      <ToastContainer />

      <h1 className="text-2xl font-bold mb-2">{book.title}</h1>
      <p className="text-sm text-gray-600 mb-4">{book.authors.join(', ')}</p>

      {/* Replace <img> with Next.js Image for optimization */}
      <Image
        src={book.thumbnail}
        alt={book.title}
        width={160}
        height={224}
        className="mb-4 rounded"
        priority
      />

      {/* Book edit form */}
      <form onSubmit={handleSubmit} className="space-y-3 mb-8">
        {/* form inputs */}
        <div>
          <label>Status:</label>
          <select
            className="w-full p-2 border"
            value={form.status}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
          >
            <option value="wishlist">Wishlist</option>
            <option value="reading">Reading</option>
            <option value="finished">Finished</option>
            <option value="abandoned">Abandoned</option>
          </select>
        </div>
        <input
          type="number"
          min={1}
          max={5}
          value={form.rating}
          onChange={(e) => setForm((f) => ({ ...f, rating: e.target.value }))}
          className="w-full p-2 border"
          placeholder="Rating (1-5)"
        />
        <input
          type="text"
          value={form.tags}
          onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
          className="w-full p-2 border"
          placeholder="Tags (comma separated)"
        />
        <input
          type="date"
          value={form.startDate}
          onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
          className="w-full p-2 border"
        />
        <input
          type="date"
          value={form.endDate}
          onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
          className="w-full p-2 border"
        />
        <button className="bg-blue-600 text-white px-4 py-2 rounded">Save</button>
      </form>

      <button onClick={handleDelete} className="bg-red-500 text-white px-4 py-2 rounded">
        Delete Book
      </button>

      <button
        onClick={async () => {
          if (!id) return;
          try {
            const res = await fetch(`/api/books/${id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ isPublic: !book.isPublic }),
            });
            if (res.ok) {
              toast.success(book.isPublic ? '🔒 Made private' : '🌍 Made public');
              location.reload();
            } else {
              toast.error('❌ Failed to update visibility');
            }
          } catch {
            toast.error('❌ Failed to update visibility');
          }
        }}
        className={`mt-2 px-4 py-2 rounded ${
          book.isPublic ? 'bg-yellow-500' : 'bg-gray-400'
        } text-white`}
      >
        {book.isPublic ? '🔒 unpublic' : '🌍 public'}
      </button>

      {/* Notes */}
      <h2 className="mt-10 text-xl font-bold">📝 Reading Notes</h2>
      <form onSubmit={handleNoteSubmit} className="space-y-2 mt-2 mb-4">
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Write a note..."
          className="w-full p-2 border rounded"
        />
        <button className="bg-green-600 text-white px-4 py-2 rounded">
          {editingNote ? 'Update Note' : 'Add Note'}
        </button>
      </form>

      <ul className="space-y-2">
        {notes.map((note) => (
          <li key={note._id} className="bg-gray-100 p-3 rounded">
            <p className="text-sm whitespace-pre-line">{note.content}</p>
            <p className="text-xs text-gray-500 mt-1">
              Last updated: {new Date(note.updatedAt).toLocaleString()}
            </p>

            <div className="mt-2 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => handleEdit(note)}
                className="text-blue-600 text-sm"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => handleDeleteNote(note._id)}
                className="text-red-600 text-sm"
              >
                Delete
              </button>

              <button
                type="button"
                onClick={async () => {
                  try {
                    const res = await fetch(`/api/notes/${note._id}`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ isPublic: !note.isPublic }),
                    });
                    if (res.ok) {
                      toast.success(
                        note.isPublic ? '🔒 Note made private' : '🌍 Note made public'
                      );
                      await fetchNotes();
                    } else {
                      toast.error('❌ Failed to update note visibility');
                    }
                  } catch {
                    toast.error('❌ Failed to update note visibility');
                  }
                }}
                className={`text-sm px-2 py-1 rounded ${
                  note.isPublic ? 'bg-yellow-500 text-white' : 'bg-gray-400 text-white'
                }`}
              >
                {note.isPublic ? 'unpublic' : 'public'}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
