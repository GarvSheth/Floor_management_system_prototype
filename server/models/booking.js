import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'MeetingRoom', required: true },
  userId: { type: String, required: true },//as of now using string, can be changed to ObjectID later
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  numberOfParticipants: { type: Number, required: true },
}, { timestamps: true });

export default mongoose.model('Booking', bookingSchema);
