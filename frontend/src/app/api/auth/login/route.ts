import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { StorageService } from '@/services/storage.service';

const JWT_SECRET = process.env.JWT_SECRET || 'Kasim';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();
    if (!username || !password) {
      return NextResponse.json({ message: 'Username and password are required' }, { status: 400 });
    }

    const users = await StorageService.getUsers();
    const user = users.find((u: any) => u.username.toLowerCase() === username.toLowerCase().trim());

    if (!user) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const token = jwt.sign(
      { uid: user.uid, role: user.role, employeeId: user.employeeId },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    const cookieStore = await cookies();
    cookieStore.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 24 * 60 * 60 // 1 day
    });

    const employee = user.employeeId ? await StorageService.getEmployee(user.employeeId) : null;
    const avatarUrl = employee?.profile?.avatarUrl || null;

    return NextResponse.json({
      message: 'Logged in successfully',
      user: {
        uid: user.uid,
        username: user.username,
        role: user.role,
        employeeId: user.employeeId,
        avatarUrl
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
