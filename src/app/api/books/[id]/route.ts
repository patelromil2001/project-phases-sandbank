import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Book from '@/models/Book';

interface Params {
  id: string;
}

interface UpdateBookBody {
  title?: string;
  author?: string;
  description?: string;
  [key: string]: unknown;
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<Params> }
) {
  await connectDB();

  const { id } = await context.params;
  const book = await Book.findById(id);

  if (!book) {
    return NextResponse.json({ error: 'Book not found' }, { status: 404 });
  }

  return NextResponse.json(book);
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<Params> }
) {
  await connectDB();

  const token = req.cookies.get('token')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;
  const updates: UpdateBookBody = await req.json();

  // Optional: Add validation for updates here if needed

  const updatedBook = await Book.findByIdAndUpdate(id, updates, { new: true });
  if (!updatedBook) {
    return NextResponse.json({ error: 'Book not found' }, { status: 404 });
  }

  return NextResponse.json(updatedBook);
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<Params> }
) {
  await connectDB();

  const token = req.cookies.get('token')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;
  const deletedBook = await Book.findByIdAndDelete(id);

  if (!deletedBook) {
    return NextResponse.json({ error: 'Book not found' }, { status: 404 });
  }

  return NextResponse.json({ message: 'Book deleted' });
}
