import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db';
import User from '@/models/User';

interface ResetPasswordBody {
  email: string;
  newPassword: string;
}

const validatePassword = (password: string): boolean => {
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /\d/.test(password) &&
    /[!@#$%^&*(),.?":{}|<>]/.test(password)
  );
};

export async function POST(req: NextRequest) {
  await connectDB();

  const body: ResetPasswordBody = await req.json();
  const { email, newPassword } = body;

  if (!email || !newPassword) {
    return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
  }

  if (!validatePassword(newPassword)) {
    return NextResponse.json(
      { error: 'Password does not meet requirements' },
      { status: 400 }
    );
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) {
    return NextResponse.json(
      { error: 'No user found with this email' },
      { status: 404 }
    );
  }

  user.password = await bcrypt.hash(newPassword, 12);
  await user.save();

  return NextResponse.json({
    message: 'Password reset successfully! You can now log in.',
  });
}
