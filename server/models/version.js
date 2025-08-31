import mongoose from "mongoose";

const versionSchema = new mongoose.Schema({
  resourceType: { type: String, enum: ["DESK", "MEETING_ROOM"]},
  floorId: { type: mongoose.Schema.Types.ObjectId, ref: "Floor" },
  changedBy: { type: String }, // admin username/id
  action: {
    type: String,
    required : true 
  },
  previousState: Object, 
  newState: Object, 
  timestamp: { type: Date, default: Date.now }
});

versionSchema.path("action").validate(function(value) {
  if (this.resourceType === "DESK") {
    return ["ASSIGN_DESK", "VACATE_DESK", "BLOCK_DESK"].includes(value);
  } 
  if (this.resourceType === "MEETING_ROOM") {
    return ["BOOK_ROOM", "CANCEL_BOOKING", "UPDATE_ROOM"].includes(value);
  }
  return false;
}, "Invalid action for the given resourceType");

export default mongoose.model("Version", versionSchema);
