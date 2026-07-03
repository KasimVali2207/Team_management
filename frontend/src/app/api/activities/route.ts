import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { StorageService } from '@/services/storage.service';

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const logs = await StorageService.getActivityLogs();
    return NextResponse.json(logs);
  } catch (error) {
    console.error('Fetch activities error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await StorageService.clearActivityLogs();
    return NextResponse.json({ message: 'Activity logs cleared successfully' });
  } catch (error) {
    console.error('Clear activities error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
