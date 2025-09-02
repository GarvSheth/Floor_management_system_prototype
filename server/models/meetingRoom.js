import mongoose from "mongoose";

const meetingRoomSchema = new mongoose.Schema({
  name: { type: String, required: true }, 
  capacity: { type: Number, required: true },
  floor: {type: Number, required: true},
  amenities: [{ type: String }],
  status: { type: String, enum: ['Available', 'Occupied'], default: 'Available' },
});

export default mongoose.model("meetingRoom", meetingRoomSchema);