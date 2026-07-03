import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { StorageService } from '@/services/storage.service';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; section: string }> }
) {
  try {
    const { id, section } = await params;
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const matchedUser = await StorageService.getUserByUid(id);
    const empId = matchedUser?.employeeId ?? id;

    if (session.role !== 'Lead' && session.employeeId !== empId) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const allowedSections = ['profile', 'leavePlans', 'blockLeaves', 'onCall', 'trainings', 'demoSessions', 'monthlyUpdates'];
    if (!allowedSections.includes(section)) {
      return NextResponse.json({ message: 'Invalid section' }, { status: 400 });
    }

    const body = await request.json();

    // Atomic section update
    const updated = await StorageService.updateEmployeeSection(empId, section, body);
    if (!updated) {
      return NextResponse.json({ message: 'Employee not found' }, { status: 404 });
    }

    const sectionLabels: Record<string, string> = {
      profile: 'Updated Personal Details',
      leavePlans: 'Updated Leave Plans',
      blockLeaves: 'Updated Block Leave',
      onCall: 'Changed OnCall Status',
      trainings: 'Updated Training & Certifications',
      demoSessions: 'Updated Demo Sessions',
      monthlyUpdates: 'Added Monthly Update',
    };

    await StorageService.logActivity({
      uid: session.uid,
      employeeId: empId,
      action: sectionLabels[section] || `Updated ${section}`,
      targetId: id
    });

    return NextResponse.json({ message: 'Updated successfully', employee: updated });
  } catch (error) {
    console.error('Update section error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
