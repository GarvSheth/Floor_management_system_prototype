import mongoose from "mongoose";

const deskSchema = new mongoose.Schema({
  deskId: String,
  status: String,
  employee: { type: String, default: null }, 
});

const meetingRoomSchema = new mongoose.Schema({
  name: { type: String, required: true }, 
  capacity: { type: Number, required: true },
  amenities: [{ type: String }],
});

const floorSchema = new mongoose.Schema({
  floorId: Number,
  desks: [deskSchema],
  meetingRooms: [meetingRoomSchema]
});

export default mongoose.model("Floor", floorSchema);
