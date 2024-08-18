import mongoose, { Document, Model, Schema } from 'mongoose';

// Define the interface for the Chat document
interface IChat extends Document {
  senderId: string;
  receiverId: string;  // Fixed typo: 'recieverId' to 'receiverId'
  message: string;
  timestamp: Date;
}

// Define the Chat schema
const chatSchema: Schema<IChat> = new mongoose.Schema({
  senderId: {
    type: String,
    required: true
  },
  receiverId: {  // Fixed typo: 'recieverId' to 'receiverId'
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Create and export the Chat model
const Chat: Model<IChat> = mongoose.model<IChat>('Chat', chatSchema);

export default Chat;