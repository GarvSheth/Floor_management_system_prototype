import mongoose from "mongoose";

const deskSchema = new mongoose.Schema({
  deskId: String,
  status: String,
  employee: { type: String, default: null }, 
});

const meetingRoomSchema = new mongoose.Schema({
  roomId: String,
  isOccupied: { type: Boolean, default: false },
});

const floorSchema = new mongoose.Schema({
  floorId: Number,
  desks: [deskSchema],
  meetingRooms: [meetingRoomSchema]
});

export default mongoose.model("Floor", floorSchema);
