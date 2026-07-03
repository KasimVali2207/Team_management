/**
 * Update passwords for all existing users in MongoDB.
 * Run with: node update-passwords.js
 */
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) { console.error('❌ MONGODB_URI not set'); process.exit(1); }

const UserSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.models.User || mongoose.model('User', UserSchema, 'users');

async function run() {
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected to MongoDB');

  const users = await User.find({});
  console.log(`Found ${users.length} users`);

  for (const user of users) {
    let plainPassword;

    if (user.role === 'Lead') {
      plainPassword = 'Lead@2026';
    } else {
      // All existing members and any future members added without a custom password
      plainPassword = 'Member@2026';
    }

    const hashed = await bcrypt.hash(plainPassword, 10);
    await User.updateOne({ _id: user._id }, { $set: { password: hashed } });
    console.log(`  ✔ Updated password for [${user.role}] ${user.username}`);
  }

  console.log('\n🎉 All passwords updated!');
  console.log('   Lead   → Lead@2026');
  console.log('   Members→ Member@2026');
  await mongoose.disconnect();
}

run().catch(err => { console.error('❌', err); process.exit(1); });
