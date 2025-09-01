import express from "express";
const router = express.Router();
import Floor from "../models/floor.js";
import Version from "../models/version.js";
import { requireAuth } from "../middleware/authMiddleware.js";
const app = express();

app.use(express.json());

//get route
router.get("/floor", requireAuth,async (req, res) => {
    try {
        const floors = await Floor.find().select(Floor.floorId);
        const floorNumbers = floors.map(f => f.floorId);
        res.json(floorNumbers);
    } catch (error) {
        
    }
})

export default router;