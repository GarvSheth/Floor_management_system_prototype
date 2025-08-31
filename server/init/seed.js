import mongoose from "mongoose";
import Floor from "../models/floor.js";

const MONGO_URL = "mongodb://127.0.0.1:27017/floor_management";

async function seedDatabase() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("Connected to DB");

    // Clear existing data
    await Floor.deleteMany({});
    console.log("Cleared existing floors");

    // Create 3 floors
    const floors = [];
    for (let f = 1; f <= 3; f++) {
      const desks = [];
      const meetingRooms = [];

      // 12 desks per floor
      for (let d = 1; d <= 12; d++) {
        desks.push({ deskId: `D-${f}-${d}`, status: "Available", employee: null });
      }

      // 3 meeting rooms per floor
      for (let r = 1; r <= 3; r++) {
        meetingRooms.push({ roomId: `R-${f}-${r}`, isOccupied: false });
      }

      floors.push(new Floor({ floorId: f, desks, meetingRooms }));
    }

    await Floor.insertMany(floors);
    console.log("Seeded floors successfully");

    process.exit();
  } catch (err) {
    console.error("Error seeding database:", err);
    process.exit(1);
  }
}

seedDatabase();
