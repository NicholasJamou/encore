import mongoose, { Document, Model, Schema } from 'mongoose';
import bcrypt from 'bcrypt';

interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  phone: number;
  gender?: 'male' | 'female' | 'other';
  verified: boolean;
  verificationToken?: string;
  sentRequests: mongoose.Types.ObjectId[];
  receivedRequests: mongoose.Types.ObjectId[];
  friends: mongoose.Types.ObjectId[];
  images: string[];
  bio?: string;
  hobbies: string[];
}

const userSchema: Schema<IUser> = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  phone: {
    type: Number,
    required: true,
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
  },
  verified: {
    type: Boolean,
    default: false,
  },
  verificationToken: String,
  sentRequests: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  receivedRequests: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  friends: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  images: [String],
  bio: String,
  hobbies: [String],
});

userSchema.pre('save', async function(next) {
  if (this.isModified('password') && !this.password.startsWith('$2b$')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);

export default User;