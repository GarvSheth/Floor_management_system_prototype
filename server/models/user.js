import mongoose from "mongoose";
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["Admin", "Employee", "FacilityAdmin"],
      required: true
    }
});

export default mongoose.model("User", userSchema);