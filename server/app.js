import 'dotenv/config'; 
import express from "express";
import mongoose from "mongoose";
import cors from "cors";

import authRouter from './routes/auth.js';
import floorRouter from "./routes/floor.js";
import landingRouter from "./routes/landing.js";
import meetingRoomRouter from './routes/meetingRoom.js';
import historyRouter from './routes/history.js';
import cookieParser from 'cookie-parser';
import { requireAuth } from './middleware/authMiddleware.js';

const app = express();

app.use(cookieParser());

app.use(cors({
  origin: "http://localhost:5173", 
  credentials: true,
}));
app.use(express.json()); 

const MONGO_URL = process.env.MONGO_URL;
const PORT = 3000;

mongoose.connect(MONGO_URL)
    .then(() => console.log("Connected to DB"))
    .catch((err) => console.error("DB connection error:", err));

app.use("/", authRouter);
app.use("/", landingRouter);
app.use("/floor", floorRouter);
app.use("/room", meetingRoomRouter);
app.use("/history", historyRouter);

app.get("/check", (req, res) => {
  res.send("Backend is healthy and running!");
});


app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
