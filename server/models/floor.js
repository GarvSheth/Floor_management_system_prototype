import mongoose from "mongoose";

const deskSchema = new mongoose.Schema({
  deskId: String,
  status: String,
  employee: { type: String, default: null }, 
});

const floorSchema = new mongoose.Schema({
  floorId: Number,
  desks: [deskSchema],
});

export default mongoose.model("Floor", floorSchema);
