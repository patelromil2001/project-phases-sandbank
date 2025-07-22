'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-toastify';

interface Note {
  _id: string;
  bookId: string;
  content: string;
  updatedAt: string;
}

interface Book {
  _id: string;
  title: string;
  authors?: string[];
  thumbnail?: string;
}

export default function NotesOverviewPage() {
  const { user, loading } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [books, setBooks] = useState<Record<string, Book>>({});
  const [editNoteId, setEditNoteId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const res = await fetch('/api/notes');
        const data: Note[] = await res.json();
        setNotes(data);

        const uniqueBookIds = [...new Set(data.map((note) => note.bookId))];
        const booksData = await Promise.all(
          uniqueBookIds.map((id) =>
            fetch(`/api/books/${id}`).then((res) => (res.ok ? res.json() : null))
          )
        );

        const bookMap: Record<string, Book> = {};
        booksData.forEach((book) => {
          if (book && book._id) {
            bookMap[book._id] = book;
          }
        });

        setBooks(bookMap);
      } catch {
        toast.error('Failed to fetch notes or books.');
      }
    };

    fetchNotes();
  }, []);

  const handleUpdate = async (noteId: string) => {
    try {
      const res = await fetch(`/api/notes/${noteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editContent }),
      });

      if (!res.ok) throw new Error('Update failed');

      toast.success('Note updated successfully');
      setEditNoteId(null);
      setEditContent('');
      location.reload();
    } catch {
      toast.error('Failed to update note');
    }
  };

  const handleDelete = async (noteId: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this note?');
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/notes/${noteId}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Delete failed');

      setNotes((prev) => prev.filter((n) => n._id !== noteId));
      toast.success('Note deleted');
    } catch {
      toast.error('Failed to delete note');
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
          <h1 className="text-2xl font-bold text-red-600 mb-2">
            You need to log in to view your notes
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">📒 All Reading Notes</h1>
      {notes.map((note) => {
        const book = books[note.bookId] || {};
        return (
          <div key={note._id} className="mb-6 border rounded p-4 bg-white shadow-sm">
            <div className="flex gap-4">
              {book.thumbnail && (
                <Image
                  src={book.thumbnail}
                  alt={book.title || 'Book Cover'}
                  width={80}
                  height={112}
                  className="rounded object-cover"
                />
              )}
              <div className="flex-1">
                <Link href={`/books/${note.bookId}`}>
                  <h2 className="text-lg font-semibold text-blue-600 hover:underline">
                    {book.title || 'Unknown Book'}
                  </h2>
                </Link>
                <p className="text-sm text-gray-500 mb-2">
                  {book.authors?.join(', ') || 'Unknown Author'}
                </p>

                {editNoteId === note._id ? (
                  <>
                    <textarea
                      className="w-full p-2 border rounded mb-2"
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                    />
                    <button
                      onClick={() => handleUpdate(note._id)}
                      className="text-sm bg-blue-600 text-white px-3 py-1 rounded mr-2"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditNoteId(null);
                        setEditContent('');
                      }}
                      className="text-sm text-gray-600"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Updated: {new Date(note.updatedAt).toLocaleString()}
                    </p>
                    <div className="mt-2 flex gap-3">
                      <button
                        onClick={() => {
                          setEditNoteId(note._id);
                          setEditContent(note.content);
                        }}
                        className="text-sm text-blue-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(note._id)}
                        className="text-sm text-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
