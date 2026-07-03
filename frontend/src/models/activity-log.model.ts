import mongoose, { Schema } from 'mongoose';

const ActivityLogSchema = new Schema({
  id:         { type: String, required: true, unique: true },
  uid:        { type: String },
  employeeId: { type: String },
  action:     { type: String, required: true },
  targetId:   { type: String },
  timestamp:  { type: String, required: true },
});

export const ActivityLogModel = mongoose.models.ActivityLog || mongoose.model('ActivityLog', ActivityLogSchema);
