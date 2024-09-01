import mongoose, { Document, Model, Schema } from 'mongoose';

interface IUser extends Document {
  supabaseId: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
  savedEvents: string[];
  gender?: 'male' | 'female' | 'other';
  verified: boolean;
  dateOfBirth: Date;
  verificationToken?: string;
  sentRequests: mongoose.Types.ObjectId[];
  receivedRequests: mongoose.Types.ObjectId[];
  friends: mongoose.Types.ObjectId[];
  images: string[];
  bio?: string;
  hobbies: string[];
}

const userSchema: Schema<IUser> = new mongoose.Schema({
  supabaseId: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
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
    required: false,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  savedEvents: [{
    type: String,
    ref: 'Event' // Assuming you have an Event model
  }],
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
  },
  verified: {
    type: Boolean,
    default: false,
  },
  dateOfBirth: {
    type: Date,
    required: true,
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

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", userSchema);

export default User;