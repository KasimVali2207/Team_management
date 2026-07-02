import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { StorageService } from './services/storage.service';
import { authenticate, AuthRequest, requireRole } from './middlewares/auth.middleware';

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-in-prod';

app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// --- AUTHENTICATION ---
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const users = await StorageService.getUsers();
    // Case-insensitive username matching
    const user = users.find((u: any) => u.username.toLowerCase() === username.toLowerCase().trim());

    if (!user) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign(
      { uid: user.uid, role: user.role, employeeId: user.employeeId },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    const employee = user.employeeId ? await StorageService.getEmployee(user.employeeId) : null;
    const avatarUrl = employee?.profile?.avatarUrl || null;

    res.json({
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
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

app.get('/api/auth/me', authenticate, async (req: AuthRequest, res) => {
  if (!req.user) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }
  try {
    const users = await StorageService.getUsers();
    const user = users.find((u: any) => u.uid === req.user?.uid);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    const employee = user.employeeId ? await StorageService.getEmployee(user.employeeId) : null;
    res.json({
      user: {
        uid: user.uid,
        username: user.username,
        role: user.role,
        employeeId: user.employeeId,
        avatarUrl: employee?.profile?.avatarUrl || null
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// --- EMPLOYEES ---
// Get all employees (Lead only)
app.get('/api/employees', authenticate, requireRole('Lead'), async (req: AuthRequest, res) => {
  try {
    const employees = await StorageService.getAllEmployees();
    res.json(employees.map(e => e.profile));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching employees' });
  }
});

// Create a new employee (Lead only)
app.post('/api/employees', authenticate, requireRole('Lead'), async (req: AuthRequest, res) => {
  try {
    const { name, username, password, domain, doj, yearsOfExperience, role } = req.body;

    if (!name || !username || !password) {
      res.status(400).json({ message: 'Name, username, and password are required' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ message: 'Password must be at least 6 characters' });
      return;
    }

    // Check username uniqueness
    const users = await StorageService.getUsers();
    const exists = users.find((u: any) => u.username.toLowerCase() === username.toLowerCase().trim());
    if (exists) {
      res.status(409).json({ message: 'Username already taken — choose a different one' });
      return;
    }

    // Generate next UID (find max existing EMP number + 1)
    const allUsers = await StorageService.getUsers();
    const maxNum = allUsers.reduce((max: number, u: any) => {
      const match = u.uid?.match(/EMP-(\d+)/);
      return match ? Math.max(max, parseInt(match[1])) : max;
    }, 0);
    const uid = `EMP-${String(maxNum + 1).padStart(3, '0')}`;

    // Hash the Lead-provided password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user entry
    const newUser = { uid, username: username.trim(), password: hashedPassword, role: 'Member', employeeId: uid };
    users.push(newUser);
    await StorageService.saveUsers(users);

    // Create employee JSON file
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
      onCall: [],
      trainings: [],
      demoSessions: [],
      monthlyUpdates: []
    };

    await StorageService.updateEmployee(uid, employeeData);

    // Log activity
    await StorageService.logActivity({
      uid: req.user?.uid,
      employeeId: req.user?.employeeId,
      action: `Added new member: ${name}`,
      targetId: uid
    });

    res.status(201).json({ message: 'Employee created successfully', uid, defaultPassword: 'Member@2026' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating employee' });
  }
});

// Get specific employee profile (Lead or Self)
app.get('/api/employees/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const id = req.params.id as string;

    const users = await StorageService.getUsers();
    const matchedUser = users.find((u: any) => u.uid === id || u.employeeId === id);
    const empId = matchedUser ? matchedUser.employeeId : id;

    if (req.user?.role !== 'Lead' && req.user?.employeeId !== empId) {
      res.status(403).json({ message: 'Forbidden' });
      return;
    }

    const employee = await StorageService.getEmployee(empId);
    if (!employee) {
      res.status(404).json({ message: 'Employee not found' });
      return;
    }

    res.json(employee);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching employee' });
  }
});

// Delete an employee (Lead only)
app.delete('/api/employees/:id', authenticate, requireRole('Lead'), async (req: AuthRequest, res) => {
  try {
    const id = req.params.id as string;

    const users = await StorageService.getUsers();
    const matchedUser = users.find((u: any) => u.uid === id || u.employeeId === id);
    const empId = matchedUser ? matchedUser.employeeId : id;

    if (empId === 'EMP-000') {
      res.status(400).json({ message: 'Cannot remove the Lead account' });
      return;
    }

    const employee = await StorageService.getEmployee(empId);
    if (!employee) {
      res.status(404).json({ message: 'Employee not found' });
      return;
    }

    // Delete JSON file
    try {
      await StorageService.deleteEmployee(empId);
    } catch (_) {}

    // Also remove from users.json
    const filtered = users.filter((u: any) => u.uid !== id && u.employeeId !== empId);
    await StorageService.saveUsers(filtered);

    await StorageService.logActivity({
      uid: req.user?.uid,
      employeeId: req.user?.employeeId,
      action: `Removed member: ${employee.profile?.name || empId}`,
      targetId: id
    });

    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error removing member' });
  }
});

// Update specific employee section (Lead or Self)
app.put('/api/employees/:id/:section', authenticate, async (req: AuthRequest, res) => {
  try {
    const id = req.params.id as string;
    const section = req.params.section as string;

    const users = await StorageService.getUsers();
    const matchedUser = users.find((u: any) => u.uid === id || u.employeeId === id);
    const empId = matchedUser ? matchedUser.employeeId : id;

    if (req.user?.role !== 'Lead' && req.user?.employeeId !== empId) {
      res.status(403).json({ message: 'Forbidden' });
      return;
    }

    const allowedSections = ['profile', 'leavePlans', 'blockLeaves', 'onCall', 'trainings', 'demoSessions', 'monthlyUpdates'];
    if (!allowedSections.includes(section)) {
      res.status(400).json({ message: 'Invalid section' });
      return;
    }

    const employee = await StorageService.getEmployee(empId);
    if (!employee) {
      res.status(404).json({ message: 'Employee not found' });
      return;
    }

    employee[section] = req.body;
    if (section === 'profile') {
      employee[section].lastUpdated = new Date().toISOString();
    }
    await StorageService.updateEmployee(empId, employee);

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
      uid: req.user?.uid,
      employeeId: empId,           // the employee whose data changed
      action: sectionLabels[section] || `Updated ${section}`,
      targetId: id
    });

    res.json({ message: 'Updated successfully', employee });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating employee' });
  }
});

// --- DASHBOARD (Lead Analytics) ---
app.get('/api/dashboard', authenticate, requireRole('Lead'), async (req: AuthRequest, res) => {
  try {
    const employees = await StorageService.getAllEmployees();
    const members = employees.filter(e => e.profile?.role === 'Member');

    const totalMembers = members.length;
    let peopleOnLeave = 0;
    let peopleOnCall = 0;
    let pendingTrainings = 0;
    let completedTrainings = 0;
    let totalBlockLeaves = 0;
    let totalDemoSessions = 0;
    let profileCompletionSum = 0;

    const memberSummaries: any[] = [];

    members.forEach(emp => {
      const profileFields = ['name','domain','doj','yearsOfExperience','functions','tribe','squadName','scrumMaster','chapterLead','copReferent','teamPocOnshore','assignmentGroupManager','hvd','assignmentGroup'];
      const filled = profileFields.filter(f => emp.profile?.[f] !== undefined && emp.profile?.[f] !== null && emp.profile?.[f] !== '').length;
      const completion = Math.round((filled / profileFields.length) * 100);
      profileCompletionSum += completion;

      const onCallActive = emp.onCall?.currentStatus === 'Active' || emp.onCall?.currentStatus === 'On-Call Scheduled';
      const onLeave = emp.leavePlans?.some((l: any) => l.status === 'Approved' || l.status === 'Planned');
      if (onCallActive) peopleOnCall++;
      if (onLeave) peopleOnLeave++;

      const myPending = (emp.trainings || []).filter((t: any) => t.completionStatus !== 'Completed').length;
      const myCompleted = (emp.trainings || []).filter((t: any) => t.completionStatus === 'Completed').length;
      pendingTrainings += myPending;
      completedTrainings += myCompleted;

      totalBlockLeaves += (emp.blockLeaves || []).length;
      totalDemoSessions += (emp.demoSessions || []).length;

      memberSummaries.push({
        uid: emp.profile?.uid,
        name: emp.profile?.name,
        domain: emp.profile?.domain || 'Unassigned',
        status: emp.profile?.status || 'Active',
        onLeave,
        onCallActive,
        profileCompletion: completion,
        pendingTrainings: myPending,
      });
    });

    const avgProfileCompletion = totalMembers > 0 ? Math.round(profileCompletionSum / totalMembers) : 0;

    res.json({
      totalMembers,
      peopleOnLeave,
      peopleOnCall,
      pendingTrainings,
      completedTrainings,
      totalBlockLeaves,
      totalDemoSessions,
      avgProfileCompletion,
      memberSummaries,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error loading dashboard' });
  }
});

// --- ACTIVITIES & NOTIFICATIONS ---
app.get('/api/activities', authenticate, async (req: AuthRequest, res) => {
  try {
    const logs = await StorageService.getActivityLogs();
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching activities' });
  }
});

// Clear all activity logs
app.delete('/api/activities', authenticate, async (req: AuthRequest, res) => {
  try {
    await StorageService.clearActivityLogs();
    res.json({ message: 'Activity logs cleared successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error clearing activities' });
  }
});

// Delete a single activity log
app.delete('/api/activities/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    await StorageService.deleteActivityLog(id as string);
    res.json({ message: 'Activity log deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting activity log' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
