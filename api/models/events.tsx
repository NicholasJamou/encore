import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IEvent extends Document {
  _id: mongoose.Types.ObjectId;
  City: string;
  Event: string;
  date: string;
  Image_URL: string;
  Venue: string;
}

const eventSchema: Schema<IEvent> = new mongoose.Schema({
  City: {
    type: String,
    required: true
  },
  Event: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  Image_URL: {
    type: String,
    required: true
  },
  Venue: {
    type: String,
    required: true
  }
}, { collection: 'events' });

const Event: Model<IEvent> = mongoose.model<IEvent>('Event', eventSchema);

export { Event };
export default Event;