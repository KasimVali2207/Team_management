import { connectToDatabase } from '../lib/db';
import { UserModel } from '../models/user.model';
import { EmployeeModel } from '../models/employee.model';
import { ActivityLogModel } from '../models/activity-log.model';
import { NotificationModel } from '../models/notification.model';

export class StorageService {
  // Ensure connection helper
  private static async ensureDb() {
    await connectToDatabase();
  }

  // ── USERS ──────────────────────────────────────────────────────────────

  static async getUsers(): Promise<any[]> {
    await this.ensureDb();
    return UserModel.find({}).lean();
  }

  static async getUserByUid(uid: string): Promise<any | null> {
    await this.ensureDb();
    return UserModel.findOne({ uid }).lean();
  }

  static async getUserByUsername(username: string): Promise<any | null> {
    await this.ensureDb();
    return UserModel.findOne({
      username: { $regex: new RegExp(`^${username.trim()}$`, 'i') },
    }).lean();
  }

  static async addUser(user: {
    uid: string;
    username: string;
    password: string;
    role: string;
    employeeId: string;
  }): Promise<void> {
    await this.ensureDb();
    await UserModel.create(user);
  }

  static async removeUser(uid: string): Promise<void> {
    await this.ensureDb();
    await UserModel.deleteOne({ uid });
  }

  static async getNextUid(): Promise<string> {
    await this.ensureDb();
    const users = await UserModel.find({}, { uid: 1 }).lean();
    const max = users.reduce((m: number, u: any) => {
      const match = u.uid?.match(/EMP-(\d+)/);
      return match ? Math.max(m, parseInt(match[1])) : m;
    }, 0);
    return `EMP-${String(max + 1).padStart(3, '0')}`;
  }

  // ── EMPLOYEES ──────────────────────────────────────────────────────────

  static async getEmployee(uid: string): Promise<any | null> {
    await this.ensureDb();
    const doc = await EmployeeModel.findOne({ uid }).lean();
    if (!doc) return null;
    const { _id, __v, ...rest } = doc as any;
    return rest;
  }

  static async updateEmployee(uid: string, data: any): Promise<void> {
    await this.ensureDb();
    const { _id, __v, ...rest } = data;
    await EmployeeModel.findOneAndUpdate(
      { uid },
      { $set: { uid, ...rest } },
      { upsert: true, new: true }
    );
  }

  static async updateEmployeeSection(
    uid: string,
    section: string,
    value: any
  ): Promise<any | null> {
    await this.ensureDb();
    let mongoUpdate: Record<string, any>;

    if (section === 'profile') {
      mongoUpdate = {};
      for (const [k, v] of Object.entries(value)) {
        mongoUpdate[`profile.${k}`] = v;
      }
      mongoUpdate['profile.lastUpdated'] = new Date().toISOString();
    } else {
      mongoUpdate = { [section]: value };
    }

    return EmployeeModel.findOneAndUpdate(
      { uid },
      { $set: mongoUpdate },
      { new: true }
    ).lean();
  }

  static async deleteEmployee(uid: string): Promise<void> {
    await this.ensureDb();
    await EmployeeModel.deleteOne({ uid });
  }

  static async getAllEmployees(): Promise<any[]> {
    await this.ensureDb();
    const docs = await EmployeeModel.find({}).lean();
    return docs.map(({ _id, __v, ...rest }: any) => rest);
  }

  // ── NOTIFICATIONS ──────────────────────────────────────────────────────

  static async getNotifications(): Promise<any[]> {
    await this.ensureDb();
    return NotificationModel.find({}).lean();
  }

  static async saveNotifications(notifications: any[]): Promise<void> {
    await this.ensureDb();
    await NotificationModel.deleteMany({});
    if (notifications.length > 0) {
      await NotificationModel.insertMany(notifications);
    }
  }

  // ── ACTIVITY LOGS ──────────────────────────────────────────────────────

  static async getActivityLogs(): Promise<any[]> {
    await this.ensureDb();
    const docs = await ActivityLogModel.find({})
      .sort({ timestamp: -1 })
      .lean();
    return docs.map(({ _id, __v, ...rest }: any) => rest);
  }

  static async logActivity(activity: any): Promise<void> {
    await this.ensureDb();
    const id = Math.random().toString(36).substring(2, 11);
    await ActivityLogModel.create({
      id,
      ...activity,
      timestamp: new Date().toISOString(),
    });
    const count = await ActivityLogModel.countDocuments();
    if (count > 100) {
      const oldest = await ActivityLogModel.find({})
        .sort({ timestamp: 1 })
        .limit(count - 100)
        .select('_id');
      await ActivityLogModel.deleteMany({
        _id: { $in: oldest.map((d) => d._id) },
      });
    }
  }

  static async clearActivityLogs(): Promise<void> {
    await this.ensureDb();
    await ActivityLogModel.deleteMany({});
  }

  static async deleteActivityLog(id: string): Promise<void> {
    await this.ensureDb();
    await ActivityLogModel.deleteOne({ id });
  }
}
