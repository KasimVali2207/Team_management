import mongoose, { Schema, Document } from 'mongoose';

export interface IActivityLog extends Document {
  id: string;
  uid?: string;
  employeeId?: string;
  action: string;
  targetId?: string;
  timestamp: string;
}

const ActivityLogSchema = new Schema<IActivityLog>({
  id:         { type: String, required: true, unique: true },
  uid:        { type: String },
  employeeId: { type: String },
  action:     { type: String, required: true },
  targetId:   { type: String },
  timestamp:  { type: String, required: true },
});

export const ActivityLogModel = mongoose.models.ActivityLog || mongoose.model<IActivityLog>('ActivityLog', ActivityLogSchema);
