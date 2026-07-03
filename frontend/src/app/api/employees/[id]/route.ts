import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { StorageService } from '@/services/storage.service';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Resolve uid atomically
    const matchedUser = await StorageService.getUserByUid(id);
    const empId = matchedUser?.employeeId ?? id;

    if (session.role !== 'Lead' && session.employeeId !== empId) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const employee = await StorageService.getEmployee(empId);
    if (!employee) {
      return NextResponse.json({ message: 'Employee not found' }, { status: 404 });
    }

    return NextResponse.json(employee);
  } catch (error) {
    console.error('Fetch employee error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

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
    if (session.role !== 'Lead') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const matchedUser = await StorageService.getUserByUid(id);
    const empId = matchedUser?.employeeId ?? id;

    if (empId === 'EMP-000') {
      return NextResponse.json({ message: 'Cannot remove the Lead account' }, { status: 400 });
    }

    const employee = await StorageService.getEmployee(empId);
    if (!employee) {
      return NextResponse.json({ message: 'Employee not found' }, { status: 404 });
    }

    // Atomically delete employee and user documents
    await StorageService.deleteEmployee(empId);
    await StorageService.removeUser(id);

    await StorageService.logActivity({
      uid: session.uid,
      employeeId: session.employeeId,
      action: `Removed member: ${employee.profile?.name || empId}`,
      targetId: id
    });

    return NextResponse.json({ message: 'Member removed successfully' });
  } catch (error) {
    console.error('Delete employee error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
