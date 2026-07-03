import mongoose, { Schema } from 'mongoose';

// Use a fully flexible schema — employee data is deeply nested and variable
const EmployeeSchema = new Schema(
  {
    uid:            { type: String, required: true, unique: true },
    profile:        Schema.Types.Mixed,
    leavePlans:     { type: Array, default: [] },
    blockLeaves:    { type: Array, default: [] },
    onCall:         Schema.Types.Mixed,
    trainings:      { type: Array, default: [] },
    demoSessions:   { type: Array, default: [] },
    monthlyUpdates: { type: Array, default: [] },
  },
  { strict: false }
);

export const EmployeeModel =
  mongoose.models.Employee || mongoose.model('Employee', EmployeeSchema);
