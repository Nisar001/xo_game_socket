import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  username: string;
  email: string;
  password: string;
  avatarUrl?: string;
  bio?: string;
  phone?: string;
  status?: 'online' | 'offline' | 'away' | 'busy';
  lastSeen?: Date;
  isVerified?: boolean;
  createdAt: Date;
  updatedAt: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  // Add more fields as needed
}

const UserSchema: Schema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    avatarUrl: { type: String },
    bio: { type: String, maxlength: 200 },
    phone: { type: String },
    status: { type: String, enum: ['online', 'offline', 'away', 'busy'], default: 'offline' },
    lastSeen: { type: Date },
    isVerified: { type: Boolean, default: false },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date }
  },
  { timestamps: true }
);


UserSchema.statics.setOnline = async function (userId: string) {
  return this.findByIdAndUpdate(userId, { status: 'online' }, { new: true });
};

UserSchema.statics.setOffline = async function (userId: string) {
  return this.findByIdAndUpdate(userId, { status: 'offline', lastSeen: new Date() }, { new: true });
};


interface UserModel extends mongoose.Model<IUser> {
  setOnline(userId: string): Promise<IUser | null>;
  setOffline(userId: string): Promise<IUser | null>;
}

const User = mongoose.model<IUser, UserModel>('User', UserSchema);
export default User;