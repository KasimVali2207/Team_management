import mongoose, { Schema } from 'mongoose';

const NotificationSchema = new Schema(
  { id: { type: String, unique: true, sparse: true } },
  { strict: false }
);

export const NotificationModel = mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);
