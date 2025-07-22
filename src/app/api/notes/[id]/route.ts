import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Note from '@/models/Note';

interface Params {
  id: string;
}

interface UpdateNoteBody {
  title?: string;
  content?: string;
  [key: string]: unknown;
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<Params> }
) {
  await connectDB();

  const token = req.cookies.get('token')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const updates: UpdateNoteBody = await req.json();

  // Optional: validate updates here

  const updatedNote = await Note.findByIdAndUpdate(id, updates, { new: true });

  if (!updatedNote) {
    return NextResponse.json({ error: 'Note not found' }, { status: 404 });
  }

  return NextResponse.json(updatedNote);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<Params> }
) {
  await connectDB();

  const token = req.cookies.get('token')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  const deletedNote = await Note.findByIdAndDelete(id);

  if (!deletedNote) {
    return NextResponse.json({ error: 'Note not found' }, { status: 404 });
  }

  return NextResponse.json({ message: 'Note deleted' });
}
