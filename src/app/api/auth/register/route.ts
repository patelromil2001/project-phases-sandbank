import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db';
import User from '@/models/User';

// Validation functions
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

const validateName = (name: string): boolean => {
  return name.trim().length >= 2 && name.trim().length <= 50;
};

const validateUsername = (username: string): boolean => {
  return username.length >= 3 && username.length <= 20 && /^[a-zA-Z0-9_-]+$/.test(username);
};

interface RegisterBody {
  name: string;
  username?: string;
  email: string;
  password: string;
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body: RegisterBody = await req.json();
    const { name, username, email, password } = body;

    // Input validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    if (!validateName(name)) {
      return NextResponse.json(
        { error: 'Name must be between 2 and 50 characters' },
        { status: 400 }
      );
    }

    if (username && !validateUsername(username)) {
      return NextResponse.json(
        {
          error:
            'Username must be between 3 and 20 characters and can only contain letters, numbers, underscores, and hyphens',
        },
        { status: 400 }
      );
    }

    if (!validateEmail(email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { error: passwordValidation.errors.join(', ') },
        { status: 400 }
      );
    }

    // Check if user exists by email
    const existingUserByEmail = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (existingUserByEmail) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 400 }
      );
    }

    // Check if username exists (if provided)
    if (username) {
      const existingUserByUsername = await User.findOne({
        username: username.toLowerCase().trim(),
      });

      if (existingUserByUsername) {
        return NextResponse.json(
          { error: 'This username is already taken' },
          { status: 400 }
        );
      }
    }

    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const userData: {
      name: string;
      email: string;
      password: string;
      username?: string;
    } = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
    };

    if (username) {
      userData.username = username.toLowerCase().trim();
    }

    const newUser = await User.create(userData);

    return NextResponse.json(
      {
        message: 'Account created successfully! Please log in.',
        userId: newUser._id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);

    if (
      error instanceof Error &&
      error.message.includes('duplicate key')
    ) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
}
