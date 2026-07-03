import { UserModel } from '../models/user.model';
import { EmployeeModel } from '../models/employee.model';
import { ActivityLogModel } from '../models/activity-log.model';
import { NotificationModel } from '../models/notification.model';

export class StorageService {
  // ── USERS ──────────────────────────────────────────────────────────────

  static async getUsers(): Promise<any[]> {
    return UserModel.find({}).lean();
  }

  /**
   * Replace the entire users collection with the given array.
   * Matches old file-based behaviour where the whole file was rewritten.
   */
  static async saveUsers(users: any[]): Promise<void> {
    // Upsert each user by uid, delete any uid no longer in the list
    const uids = users.map((u) => u.uid);
    await UserModel.deleteMany({ uid: { $nin: uids } });
    for (const user of users) {
      const { _id, __v, ...rest } = user; // strip Mongoose internals if present
      await UserModel.updateOne({ uid: user.uid }, { $set: rest }, { upsert: true });
    }
  }

  // ── EMPLOYEES ──────────────────────────────────────────────────────────

  static async getEmployee(uid: string): Promise<any | null> {
    const doc = await EmployeeModel.findOne({ uid }).lean();
    if (!doc) return null;
    // Strip Mongoose internals before returning
    const { _id, __v, ...rest } = doc as any;
    return rest;
  }

  static async updateEmployee(uid: string, data: any): Promise<void> {
    const { _id, __v, ...rest } = data;
    await EmployeeModel.findOneAndUpdate(
      { uid },
      { $set: { uid, ...rest } },
      { upsert: true, new: true }
    );
  }

  static async deleteEmployee(uid: string): Promise<void> {
    await EmployeeModel.deleteOne({ uid });
  }

  static async getAllEmployees(): Promise<any[]> {
    const docs = await EmployeeModel.find({}).lean();
    return docs.map(({ _id, __v, ...rest }: any) => rest);
  }

  // ── NOTIFICATIONS ──────────────────────────────────────────────────────

  static async getNotifications(): Promise<any[]> {
    return NotificationModel.find({}).lean();
  }

  static async saveNotifications(notifications: any[]): Promise<void> {
    await NotificationModel.deleteMany({});
    if (notifications.length > 0) {
      await NotificationModel.insertMany(notifications);
    }
  }

  // ── ACTIVITY LOGS ──────────────────────────────────────────────────────

  static async getActivityLogs(): Promise<any[]> {
    const docs = await ActivityLogModel.find({}).sort({ timestamp: -1 }).lean();
    return docs.map(({ _id, __v, ...rest }: any) => rest);
  }

  static async logActivity(activity: any): Promise<void> {
    const id = Math.random().toString(36).substring(2, 11);
    await ActivityLogModel.create({
      id,
      ...activity,
      timestamp: new Date().toISOString(),
    });
    // Keep only last 100 activity logs
    const count = await ActivityLogModel.countDocuments();
    if (count > 100) {
      const oldest = await ActivityLogModel.find({})
        .sort({ timestamp: 1 })
        .limit(count - 100)
        .select('_id');
      await ActivityLogModel.deleteMany({ _id: { $in: oldest.map((d) => d._id) } });
    }
  }

  static async clearActivityLogs(): Promise<void> {
    await ActivityLogModel.deleteMany({});
  }

  static async deleteActivityLog(id: string): Promise<void> {
    await ActivityLogModel.deleteOne({ id });
  }
}
