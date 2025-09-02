import express from "express";
import Version from "../models/version.js";
import DeskCommit from "../models/commit.js";

const router = express.Router();

router.get("/:deskId", async (req, res) => {
  try {
    const { deskId } = req.params;

    // Find the DeskCommit for this desk
    const deskCommit = await DeskCommit.findOne({ deskId }).lean();
    if (!deskCommit) return res.status(404).json({ error: "No commit history for this desk" });

    // Fetch versions in order
    const orderedHistory = await Promise.all(
      deskCommit.commitIds.map(commitId => Version.findOne({ commitId }).lean())
    );

    res.json({ deskId, history: orderedHistory });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;