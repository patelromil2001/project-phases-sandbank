import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

interface JwtPayload {
  userId: string;
  iat?: number;
  exp?: number;
}

export async function PUT(req: Request) {
  await connectDB();

  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let decoded: JwtPayload;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 403 });
  }

  const userId = decoded.userId;
  const body = await req.json();
  const slug = body.slug as string | undefined;

  if (!slug || typeof slug !== 'string' || slug.trim().length === 0) {
    return NextResponse.json({ error: 'Invalid slug' }, { status: 400 });
  }

  const existing = await User.findOne({ profileSlug: slug.trim() });
  if (existing) {
    return NextResponse.json({ error: 'Slug already taken' }, { status: 400 });
  }

  await User.findByIdAndUpdate(userId, { profileSlug: slug.trim() });

  return NextResponse.json({ success: true });
}
