/**
 * Ensure Lead employee record exists in MongoDB.
 * Run with: node ensure-lead.js
 */
const mongoose = require('mongoose');
require('dotenv').config();

const Employee = mongoose.model('Employee', new mongoose.Schema({}, { strict: false }), 'employees');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected');

  const exists = await Employee.findOne({ uid: 'EMP-000' });
  if (exists) {
    console.log('✅ Lead employee record already exists — nothing to do.');
    await mongoose.disconnect();
    return;
  }

  await Employee.create({
    uid: 'EMP-000',
    profile: {
      uid: 'EMP-000',
      name: 'Team Lead',
      domain: '',
      doj: new Date().toISOString().split('T')[0],
      yearsOfExperience: 0,
      functions: '', tribe: '', squadName: '', scrumMaster: '',
      chapterLead: '', copReferent: '', teamPocOnshore: '',
      assignmentGroupManager: '', hvd: '', assignmentGroup: '',
      role: 'Lead',
      status: 'Active',
      lastUpdated: new Date().toISOString(),
      profileCompletion: 10,
    },
    leavePlans: [],
    blockLeaves: [],
    onCall: {},
    trainings: [],
    demoSessions: [],
    monthlyUpdates: [],
  });

  console.log('✅ Lead employee record created (EMP-000)');
  await mongoose.disconnect();
}

run().catch(err => { console.error('❌', err); process.exit(1); });
