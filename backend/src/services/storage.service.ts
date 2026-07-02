import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = path.join(__dirname, '../../../data');
const EMPLOYEES_DIR = path.join(DATA_DIR, 'employees');

export class StorageService {
  static async readJson(filePath: string) {
    try {
      const data = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        return null;
      }
      throw error;
    }
  }

  static async writeJson(filePath: string, data: any) {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  }

  static async getUsers() {
    const data = await this.readJson(path.join(DATA_DIR, 'users.json'));
    return data || [];
  }

  static async saveUsers(users: any[]) {
    await this.writeJson(path.join(DATA_DIR, 'users.json'), users);
  }

  static async getEmployee(uid: string) {
    return await this.readJson(path.join(EMPLOYEES_DIR, `${uid}.json`));
  }

  static async updateEmployee(uid: string, data: any) {
    await this.writeJson(path.join(EMPLOYEES_DIR, `${uid}.json`), data);
  }

  static async deleteEmployee(uid: string) {
    await fs.unlink(path.join(EMPLOYEES_DIR, `${uid}.json`));
  }

  static async getAllEmployees() {
    try {
      const files = await fs.readdir(EMPLOYEES_DIR);
      const employees = [];
      for (const file of files) {
        if (file.endsWith('.json')) {
          const emp = await this.readJson(path.join(EMPLOYEES_DIR, file));
          if (emp) employees.push(emp);
        }
      }
      return employees;
    } catch (error: any) {
      if (error.code === 'ENOENT') return [];
      throw error;
    }
  }

  static async getNotifications() {
    return (await this.readJson(path.join(DATA_DIR, 'notifications.json'))) || [];
  }

  static async saveNotifications(notifications: any[]) {
    await this.writeJson(path.join(DATA_DIR, 'notifications.json'), notifications);
  }

  static async getActivityLogs() {
    return (await this.readJson(path.join(DATA_DIR, 'activity_logs.json'))) || [];
  }

  static async logActivity(activity: any) {
    const logs = await this.getActivityLogs();
    logs.unshift({
      id: Math.random().toString(36).substring(2, 11),
      ...activity,
      timestamp: new Date().toISOString()
    });
    // Keep only last 100 activities
    if (logs.length > 100) logs.length = 100;
    await this.writeJson(path.join(DATA_DIR, 'activity_logs.json'), logs);
  }

  static async clearActivityLogs() {
    await this.writeJson(path.join(DATA_DIR, 'activity_logs.json'), []);
  }

  static async deleteActivityLog(id: string) {
    const logs = await this.getActivityLogs();
    const filtered = logs.filter((log: any) => log.id !== id);
    await this.writeJson(path.join(DATA_DIR, 'activity_logs.json'), filtered);
  }
}
