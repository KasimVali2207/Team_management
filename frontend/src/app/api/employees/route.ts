import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { StorageService } from '@/services/storage.service';
import bcrypt from 'bcrypt';

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    if (session.role !== 'Lead') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const employees = await StorageService.getAllEmployees();
    return NextResponse.json(employees.map(e => e.profile));
  } catch (error) {
    console.error('Fetch employees error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    if (session.role !== 'Lead') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { name, username, password, domain, doj, yearsOfExperience, role } = await request.json();

    if (!name || !username || !password) {
      return NextResponse.json({ message: 'Name, username, and password are required' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ message: 'Password must be at least 6 characters' }, { status: 400 });
    }

    // Atomic uniqueness check
    const existing = await StorageService.getUserByUsername(username);
    if (existing) {
      return NextResponse.json({ message: 'Username already taken — choose a different one' }, { status: 409 });
    }

    // Generate next UID
    const uid = await StorageService.getNextUid();

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Add user document
    await StorageService.addUser({
      uid,
      username: username.trim(),
      password: hashedPassword,
      role: 'Member',
      employeeId: uid,
    });

    // Create employee document
    const employeeData = {
      profile: {
        uid,
        name: name.trim(),
        domain: domain || '',
        doj: doj || new Date().toISOString().split('T')[0],
        yearsOfExperience: yearsOfExperience || 0,
        functions: '',
        tribe: '',
        squadName: '',
        scrumMaster: '',
        chapterLead: '',
        copReferent: '',
        teamPocOnshore: '',
        assignmentGroupManager: '',
        hvd: '',
        assignmentGroup: '',
        role: role || 'Member',
        status: 'Active',
        lastUpdated: new Date().toISOString(),
        profileCompletion: 10,
      },
      leavePlans: [],
      blockLeaves: [],
      onCall: {},
      trainings: [],
      demoSessions: [],
      monthlyUpdates: []
    };

    await StorageService.updateEmployee(uid, employeeData);

    // Log activity
    await StorageService.logActivity({
      uid: session.uid,
      employeeId: session.employeeId,
      action: `Added new member: ${name}`,
      targetId: uid
    });

    return NextResponse.json({
      message: 'Employee created successfully',
      uid,
      username: username.trim(),
      password, // plain-text so Lead can copy and share
    }, { status: 201 });
  } catch (error) {
    console.error('Create employee error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
