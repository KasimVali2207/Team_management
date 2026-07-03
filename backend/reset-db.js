/**
 * Reset database to a clean state.
 * Keeps only the Lead account (EMP-000). Removes all dummy members + logs.
 * Run with: node reset-db.js
 */
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) { console.error('❌ MONGODB_URI not set'); process.exit(1); }

const schema = new mongoose.Schema({}, { strict: false });
const User         = mongoose.model('User',        schema,           'users');
const Employee     = mongoose.model('Employee',    new mongoose.Schema({}, { strict: false }), 'employees');
const ActivityLog  = mongoose.model('ActivityLog', new mongoose.Schema({}, { strict: false }), 'activitylogs');
const Notification = mongoose.model('Notification',new mongoose.Schema({}, { strict: false }), 'notifications');

async function run() {
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected to MongoDB\n');

  // 1. Remove all members (keep only EMP-000 = lead)
  const delUsers = await User.deleteMany({ uid: { $ne: 'EMP-000' } });
  console.log(`🗑  Removed ${delUsers.deletedCount} member user(s)`);

  const delEmployees = await Employee.deleteMany({ uid: { $ne: 'EMP-000' } });
  console.log(`🗑  Removed ${delEmployees.deletedCount} employee record(s)`);

  // 2. Reset Lead password to Lead@2026
  const hashedLead = await bcrypt.hash('Lead@2026', 10);
  await User.updateOne({ uid: 'EMP-000' }, { $set: { password: hashedLead } });
  console.log('🔑  Lead password reset → Lead@2026');

  // 3. Clear activity logs & notifications
  const delLogs = await ActivityLog.deleteMany({});
  console.log(`🗑  Cleared ${delLogs.deletedCount} activity log(s)`);

  await Notification.deleteMany({});
  console.log('🗑  Cleared notifications');

  console.log('\n🎉 Database is clean! Only Lead account remains.');
  console.log('   Lead username : lead');
  console.log('   Lead password : Lead@2026');
  console.log('\n   Team Lead can now add members dynamically from the portal.\n');

  await mongoose.disconnect();
}

run().catch(err => { console.error('❌', err); process.exit(1); });
