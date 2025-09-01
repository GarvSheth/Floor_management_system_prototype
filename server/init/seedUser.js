import mongoose from "mongoose";
import User from "../models/floor.js";

const MONGO_URL = "mongodb://127.0.0.1:27017/floor_management";

async function seedDatabase() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("Connected to DB");

    await User.deleteMany({});
    console.log("Cleared existing floors");

    const users= [
        {
            name: "Garv",
            email: "abc@gmail.com",
            password: "garv",
            role: "Admin"
        },
        {
            name: "Jason",
            email: "abcd@gmail.com",
            password: "jason",
            role: "Employee"
        },
        {
            name: "Jamie",
            email: "ab@gmail.com",
            password: "jamie",
            role: "Employee"
        },
    ];

    await User.insertMany(users);
    console.log("Seeded floors successfully");

    process.exit();
  } catch (err) {
    console.error("Error seeding database:", err);
    process.exit(1);
  }
}

seedDatabase();
