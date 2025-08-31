import express from "express";
const router = express.Router();
import Floor from "../models/floor.js";
import Version from "../models/version.js";
const app = express();

app.use(express.json());

//get route
router.get("/:floorId", async (req, res) => {
  const { floorId } = req.params;
  try {
    const floor = await Floor.findOne({ floorId: floorId });

    if (!floor) {
      return res.status(404).json({ message: "Floor not found" });
    }

    res.json(floor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//update
router.put("/:floorId/desks/:deskId", async (req, res) => {
  try {
    const { floorId, deskId } = req.params;
    const { employee, admin } = req.body;
    console.log(employee);

    const floor = await Floor.findOne({ floorId: floorId }); 
    if (!floor) return res.status(404).json({ error: "Floor not found" });

    const desk = floor.desks.find(d => d.deskId === deskId);
    if (!desk) return res.status(404).json({ error: "Desk not found" });

    // Store previous state
    const prev = { deskId: desk.deskId, employee: desk.employee };

    // ASSIGN DESK
    if (employee) {
      if (desk.employee) return res.status(400).json({ error: "Already Occupied" });
      desk.employee = employee;

    // UNASSIGN DESK
    } else {
      if (!desk.employee) return res.status(400).json({ error: "Desk is already empty" });
      desk.employee = null;
    }

    await floor.save();

    try {
      await Version.create({
        resourceType: "DESK",
        floorId: floor._id,
        changedBy: admin,
        action: employee ? "ASSIGN_DESK" : "VACATE_DESK",
        previousState: prev,
        newState: { deskId, employee },
      });
      console.log("Version created successfully");
    } catch (err) {
      console.error("Version creation failed:", err.message);
    }

    res.json({ message: "Desk updated successfully", floor });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


export default router;