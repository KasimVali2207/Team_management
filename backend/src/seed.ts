import fs from 'fs/promises';
import path from 'path';
import bcrypt from 'bcrypt';

const DATA_DIR = path.join(__dirname, '../../data');
const EMPLOYEES_DIR = path.join(DATA_DIR, 'employees');

async function ensureDir(dir: string) {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (error) {
    // ignore
  }
}

async function seed() {
  await ensureDir(DATA_DIR);
  await ensureDir(EMPLOYEES_DIR);

  // --- Clear existing employee files ---
  try {
    const files = await fs.readdir(EMPLOYEES_DIR);
    for (const file of files) {
      await fs.unlink(path.join(EMPLOYEES_DIR, file));
    }
  } catch (_) {}

  const hashPassword = async (password: string) => bcrypt.hash(password, 10);
  const leadPassword = await hashPassword('Lead@2026');

  // Only the Team Lead account — no dummy members
  const users = [
    { uid: 'EMP-000', username: 'lead', password: leadPassword, role: 'Lead', employeeId: 'EMP-000' },
  ];

  await fs.writeFile(path.join(DATA_DIR, 'users.json'), JSON.stringify(users, null, 2));

  // Lead's own profile
  const leadProfile = {
    profile: {
      uid: 'EMP-000',
      name: 'Team Lead',
      domain: '',
      doj: '',
      yearsOfExperience: 0,
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
      role: 'Lead',
      status: 'Active',
      lastUpdated: new Date().toISOString(),
      profileCompletion: 0,
    },
    leavePlans: [],
    blockLeaves: [],
    onCall: [],
    trainings: [],
    demoSessions: [],
    monthlyUpdates: []
  };

  await fs.writeFile(
    path.join(EMPLOYEES_DIR, 'EMP-000.json'),
    JSON.stringify(leadProfile, null, 2)
  );

  await fs.writeFile(path.join(DATA_DIR, 'activity_logs.json'), JSON.stringify([], null, 2));
  await fs.writeFile(path.join(DATA_DIR, 'notifications.json'), JSON.stringify([], null, 2));

  console.log('Seed completed — clean slate, only Lead account created.');
}

seed().catch(console.error);
