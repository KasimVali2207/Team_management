import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  id: string;
  [key: string]: any;
}

const NotificationSchema = new Schema(
  { id: { type: String, unique: true, sparse: true } },
  { strict: false }
);

export const NotificationModel = mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);
