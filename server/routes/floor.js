import express from "express";
const router = express.Router();
import Floor from "../models/floor.js";
import Room from "../models/meetingRoom.js";
import Version from "../models/version.js";
import versioningService from "../services/versionService.js";
import { requireAuth } from "../middleware/authMiddleware.js";
const app = express();
app.use(express.json());


// get route for specific floor with meeting rooms merged
router.get("/:floorId", requireAuth, async (req, res) => {
  const { floorId } = req.params;

  try {
    const floor = await Floor.findOne({ floorId: floorId });
    if (!floor) {
      return res.status(404).json({ message: "Floor not found" });
    }

    const meetingRooms = await Room.find({ floor: floorId }).lean(); 

    const mergedData = {
      floorId: floor.floorId,
      desks: floor.desks,
      meetingRooms: meetingRooms.map((room) => ({
        roomId: room.name,
        capacity: room.capacity,
        isOccupied: true ? room.status === "Occupied" : false,
      })),
    };

    res.json(mergedData);
  } catch (err) {
    console.error("Error fetching floor data:", err);
    res.status(500).json({ message: err.message });
  }
});

//update the desks
router.put("/:floorId/desks/:deskId", requireAuth, async (req, res) => {
  try {
    const { floorId, deskId } = req.params;
    const { employee, admin } = req.body;

    const floor = await Floor.findOne({ floorId: floorId }); 
    if (!floor) return res.status(404).json({ error: "Floor not found" });

    const desk = floor.desks.find(d => d.deskId === deskId);
    if (!desk) return res.status(404).json({ error: "Desk not found" });

    // Store previous state
    const prev = { deskId: desk.deskId, employee: desk.employee, status: desk.status };

    // ASSIGN DESK
    if (employee) {
      if (desk.employee) return res.status(400).json({ error: "Already Occupied" });
      desk.employee = employee;
      desk.status = "Occupied"

    // UNASSIGN DESK
    } else {
      if (!desk.employee) return res.status(400).json({ error: "Desk is already empty" });
      desk.employee = null;
      desk.status = "Available"
    }

    await floor.save();

    try {
      const commitData = {
        author: { id: admin, name: admin },
        message: `Desk ${deskId} was ${employee ? 'assigned to ' + employee : 'vacated'}.`,
        changes: [{
            floor: floorId,
            entityId: deskId,
            field: "employee",
            oldValue: prev.employee,
            newValue: employee,
        }]
      };
      await versioningService.createCommit(commitData);
    } catch (err) {
      console.error("Version creation failed:", err.message);
      // Decide if you want to revert the floor.save() or just log the error
    }
    res.json({ message: "Desk updated successfully", floor });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


export default router;