import mongoose, { Schema } from 'mongoose';

const UserSchema = new Schema({
  uid:        { type: String, required: true, unique: true },
  username:   { type: String, required: true },
  password:   { type: String, required: true },
  role:       { type: String, required: true },
  employeeId: { type: String, required: true },
});

export const UserModel = mongoose.models.User || mongoose.model('User', UserSchema);
