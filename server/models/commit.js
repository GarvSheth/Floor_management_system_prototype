import mongoose from "mongoose";

const DeskCommitIndexSchema = new mongoose.Schema({
  deskId: {type: String}, 
  commitIds: [String] 
});

export default mongoose.model("DeskCommit", DeskCommitIndexSchema);