/**
 * Migration script: imports existing JSON files into MongoDB.
 * Run once with: npx ts-node src/seed.ts
 */
import mongoose from 'mongoose';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';
import { UserModel } from './models/user.model';
import { EmployeeModel } from './models/employee.model';
import { ActivityLogModel } from './models/activity-log.model';

dotenv.config();

const DATA_DIR = path.join(__dirname, '../../data');
const EMPLOYEES_DIR = path.join(DATA_DIR, 'employees');

async function readJson(filePath: string) {
  try {
    const raw = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function migrate() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI not set in .env');

  console.log('🔌 Connecting to MongoDB...');
  await mongoose.connect(uri);
  console.log('✅ Connected!');

  // --- Users ---
  const users = (await readJson(path.join(DATA_DIR, 'users.json'))) || [];
  if (users.length > 0) {
    await UserModel.deleteMany({});
    await UserModel.insertMany(users);
    console.log(`👥 Migrated ${users.length} users`);
  }

  // --- Employees ---
  let empCount = 0;
  try {
    const files = await fs.readdir(EMPLOYEES_DIR);
    await EmployeeModel.deleteMany({});
    for (const file of files) {
      if (!file.endsWith('.json')) continue;
      const data = await readJson(path.join(EMPLOYEES_DIR, file));
      if (!data) continue;
      const uid = file.replace('.json', '');
      await EmployeeModel.create({ uid, ...data });
      empCount++;
    }
    console.log(`🧑‍💼 Migrated ${empCount} employees`);
  } catch (e: any) {
    if (e.code !== 'ENOENT') throw e;
  }

  // --- Activity Logs ---
  const logs = (await readJson(path.join(DATA_DIR, 'activity_logs.json'))) || [];
  if (logs.length > 0) {
    await ActivityLogModel.deleteMany({});
    await ActivityLogModel.insertMany(logs);
    console.log(`📋 Migrated ${logs.length} activity logs`);
  }

  console.log('🎉 Migration complete!');
  await mongoose.disconnect();
}

migrate().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
