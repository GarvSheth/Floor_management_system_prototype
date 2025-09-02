import express from "express";
import Version from "../models/version.js";
import DeskCommit from "../models/commit.js";
import Floor from "../models/floor.js";

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

router.post("/rollback", async (req, res) => {
  const { commitId } = req.body;

  try {
    const targetVersion = await Version.findOne({ commitId }).lean();
    if (!targetVersion) {
      return res.status(404).json({ message: "Target commit not found." });
    }

    const { floor } = targetVersion;
    const allVersions = await Version.find({ floor }).sort({ timestamp: 1 }).lean();

    const index = allVersions.findIndex(v => v.commitId === commitId);
    if (index === -1) return res.status(404).json({ message: "Target commit not found in version history." });

    const commitsToRollback = allVersions.slice(index + 1).map(v => v.commitId);
    if (commitsToRollback.length === 0) {
      return res.json({ message: "Already at target commit." });
    }

    const revertedState = {};
    allVersions
      .slice(index + 1) 
      .sort((a, b) => b.timestamp - a.timestamp)
      .forEach(v => {
        v.changes.forEach(change => {
          revertedState[change.field] = change.oldValue;
        });
      });

    await DeskCommit.updateMany(
      { commitIds: { $in: commitsToRollback } },
      { $pull: { commitIds: { $in: commitsToRollback } } }
    );

    await Version.deleteMany({ commitId: { $in: commitsToRollback } });

    await Floor.updateOne({ floorId: floor }, { $set: revertedState });

    res.json({ message: `Successfully rolled back to commit ${commitId}.` });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Rollback failed", error: err.message });
  }
});


export default router;