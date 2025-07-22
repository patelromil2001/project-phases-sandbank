import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Note from '@/models/Note';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  userId: string;
  iat?: number;
  exp?: number;
}

interface CreateNoteBody {
  bookId: string;
  content: string;
}

export async function GET(req: NextRequest) {
  await connectDB();

  const token = req.cookies.get('token')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let decoded: JwtPayload;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 403 });
  }

  const notes = await Note.find({ userId: decoded.userId }).sort({ updatedAt: -1 });

  return NextResponse.json(notes);
}

export async function POST(req: NextRequest) {
  await connectDB();

  const token = req.cookies.get('token')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let decoded: JwtPayload;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 403 });
  }

  const { bookId, content } = (await req.json()) as CreateNoteBody;

  // Optionally, validate bookId and content here

  const newNote = await Note.create({
    userId: decoded.userId,
    bookId,
    content,
  });

  return NextResponse.json(newNote);
}
