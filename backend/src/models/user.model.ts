import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  uid: string;
  username: string;
  password: string;
  role: string;
  employeeId: string;
}

const UserSchema = new Schema<IUser>({
  uid:        { type: String, required: true, unique: true },
  username:   { type: String, required: true },
  password:   { type: String, required: true },
  role:       { type: String, required: true },
  employeeId: { type: String, required: true },
});

export const UserModel = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
