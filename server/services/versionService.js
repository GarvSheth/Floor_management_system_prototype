import Version from "../models/version.js";
import DeskCommit from "../models/commit.js";
import mongoose from "mongoose";

class Commit {
  constructor({ author, message, changes, parentId = null }) {
    this.commitId = new mongoose.Types.ObjectId().toHexString();
    this.parentId = parentId;
    this.author = author;
    this.message = message;
    this.changes = changes;
    this.timestamp = new Date();
  }
}

class VersioningService {
  constructor(versionModel, indexModel) {
    this.Version = versionModel;
    this.DeskCommit = indexModel;
  }

  /**
   * Finds the most recent commit ID for a specific desk.
   * @param {string} deskId - The ID of the entity (desk) to find the last commit for.
   * @returns {Promise<string|null>} The commitId of the last commit for the given desk.
   */
  async _findLastCommitIdForDesk(deskId) {
    if (!deskId) return null;
    try {
      // Find the index document for the specific desk
      const deskIndex = await this.DeskCommit.findOne({ deskId });
      // The parent is the first commitId in the array (since we push to the front)
      return deskIndex && deskIndex.commitIds.length > 0 ? deskIndex.commitIds[0] : null;
    } catch (error) {
      console.error("Error finding last commit for desk:", error);
      return null;
    }
  }

  /**
   * Loops through all changes and updates the index for each unique deskId.
   */
  async _updateDeskIndex(changes, newCommitId) {
    if (!changes || changes.length === 0) {
      console.error("Attempted to update index with no changes.");
      return;
    }

    // Use a Set to handle commits that might have redundant changes for the same entity
    const uniqueDeskIds = new Set(changes.map(change => change.entityId));

    for (const deskId of uniqueDeskIds) {
      await this.DeskCommit.findOneAndUpdate(
        { deskId: deskId },
        {
          $push: {
            commitIds: {
              $each: [newCommitId],
              $position: 0 // Add new commit to the beginning of the array
            }
          }
        },
        { upsert: true }
      );
    }
  }

  /**
   * Creates a new commit, saves it, and updates the lookup index.
   * @param {object} commitData - The raw data for the commit.
   * @returns {Promise<object>} The saved commit document.
   */
  async createCommit(commitData) {
    // 1. Get the deskId from the changes. We'll assume one commit affects one desk.
    // A more complex system might handle multiple, but this is a safe assumption.
    const deskId = commitData.changes && commitData.changes.length > 0
      ? commitData.changes[0].entityId
      : null;
      
    if (!deskId) {
      throw new Error("Commit changes must contain at least one change with an entityId.");
    }

    // 2. Find the correct parent ID for that specific desk
    const parentId = await this._findLastCommitIdForDesk(deskId);

    // 3. Create the commit object
    const commit = new Commit({ ...commitData, parentId });
    const newVersion = new this.Version(commit);

    // 4. Save the main commit document
    await newVersion.save();
    
    // 5. Update the index for the desk(s) involved in this commit
    await this._updateDeskIndex(commit.changes, commit.commitId);

    console.log(`Version created successfully with commitId: ${commit.commitId}`);
    return newVersion;
  }
}

// Export a singleton instance, passing in both models it depends on
export default new VersioningService(Version, DeskCommit);