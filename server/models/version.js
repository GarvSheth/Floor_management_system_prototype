import mongoose from "mongoose";

const versionSchema = new mongoose.Schema({
  commitId: {
    type: String,
    required: true,
    unique: true
  },

  parentId: {
    type: String,
    default: null
  },

  author: {
    id: { type: String, required: true },
    name: { type: String, required: true }
  },
  
  message: String,

  changes: [{
    floor: { type: Number, required: true },
    entityId: { type: String, required: true },
    field: { type: String, required: true },
    oldValue: {type: String}, 
    newValue: {type: String}
  }],
  
  //timestamp for when the commit was created
  timestamp: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("Version", versionSchema);

// versionSchema.path("action").validate(function(value) {
//   if (this.resourceType === "DESK") {
//     return ["ASSIGN_DESK", "VACATE_DESK", "BLOCK_DESK"].includes(value);
//   } 
//   if (this.resourceType === "MEETING_ROOM") {
//     return ["BOOK_ROOM", "CANCEL_BOOKING", "UPDATE_ROOM"].includes(value);
//   }
//   return false;
// }, "Invalid action for the given resourceType");


