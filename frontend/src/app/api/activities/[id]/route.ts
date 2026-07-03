import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { StorageService } from '@/services/storage.service';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await StorageService.deleteActivityLog(id);
    return NextResponse.json({ message: 'Activity log deleted successfully' });
  } catch (error) {
    console.error('Delete single activity error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
