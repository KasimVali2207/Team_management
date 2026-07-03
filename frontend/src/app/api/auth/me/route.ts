import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { StorageService } from '@/services/storage.service';

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const user = await StorageService.getUserByUid(session.uid);
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const employee = user.employeeId ? await StorageService.getEmployee(user.employeeId) : null;

    return NextResponse.json({
      user: {
        uid: user.uid,
        username: user.username,
        role: user.role,
        employeeId: user.employeeId,
        avatarUrl: employee?.profile?.avatarUrl || null
      }
    });
  } catch (error) {
    console.error('Auth/me error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
