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
   * Finds the most recent commit to determine the parent ID.
   * @returns {Promise<string|null>} The commitId of the last commit.
   */
  // async _findLastCommitId() {
  //   try {
  //     const lastCommit = await this.Version.findOne().sort({ timestamp: -1 });
  //     return lastCommit ? lastCommit.commitId : null;
  //   } catch (error) {
  //     console.error("Error finding last commit:", error);
  //     return null;
  //   }
  // }

  async _updateDeskIndex(changes, newCommitId) {
    //check for empty or not
    if (!changes || changes.length === 0) {
      console.error("Attempted to update index with no changes.");
      return;
    }

    const change = changes[0];
    await this.DeskCommit.findOneAndUpdate(
      { deskId: change.entityId }, 
      { 
        $push: {
          commitIds: {
            $each: [newCommitId],
            $position: 0
          }
        } 
      },
      { upsert: true } //crazy, if not present then will push new desk 
    );
  }

  /**
   * Creates a new commit, saves it, and updates the lookup index.
   * @param {object} commitData - The raw data for the commit.
   * @returns {Promise<object>} The saved commit document.
   */
  async createCommit(commitData) {
    const parentId = await this._findLastCommitId();
    const commit = new Commit({ ...commitData, parentId });
    const newVersion = new this.Version(commit);

    // 3. Save the main commit document
    await newVersion.save();
    
    // 4. Call the update method to keep the index in sync
    await this._updateDeskIndex(commit.changes, commit.commitId);

    console.log(`Version created successfully with commitId: ${commit.commitId}`);
    return newVersion;
  }
}

// Export a singleton instance, passing in both models it depends on
export default new VersioningService(Version, DeskCommit);