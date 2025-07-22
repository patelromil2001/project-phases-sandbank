import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import mongoose from 'mongoose';
import Book from '@/models/Book';
import Note from '@/models/Note';

interface Params {
  userId: string;
}

export async function GET(
  _: Request,
  { params }: { params: Promise<Params> }
) {
  await connectDB();

  const { userId } = await params;

  let user = null;

  if (mongoose.Types.ObjectId.isValid(userId)) {
    user = await User.findOne({
      $or: [{ _id: userId }, { profileSlug: userId }],
    }).select('-password');
  } else {
    user = await User.findOne({ profileSlug: userId }).select('-password');
  }

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const books = await Book.find({ userId: user._id });
  const notes = await Note.find({ userId: user._id });

  return NextResponse.json({ user, books, notes });
}
