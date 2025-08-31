import express from "express";
const app = express();
import mongoose from "mongoose";
import cors from "cors";

app.use(cors({
  origin: "http://localhost:5173",
}));
app.use(express.json());

import floorRouter from "./routes/floor.js";

const MONGO_URL = 'mongodb://127.0.0.1:27017/floor_management';
const PORT = 3000;
main()
.then(() => {
    console.log("Connected to DB");
})
.catch((err) => {
    console.log(err);
});

async function main() {
  await mongoose.connect(MONGO_URL);
}

app.get("/", (req, res) => {
  res.send("Backend is running on localhost!");
});
app.use("/floor", floorRouter);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

