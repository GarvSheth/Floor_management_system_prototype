/**
 * schedulerEngine.js
 * * This file contains the core data structures and algorithms for finding and 
 * suggesting meeting rooms. It's designed to be a self-contained "engine"
 * that can be plugged into any backend framework.
 */

class MeetingRoomScheduler {
  constructor(rooms) {
    this.roomsSortedByCapacity = [...rooms].sort((a, b) => a.capacity - b.capacity);
    
    this.bookings = []; 
  }

  _binarySearchLowerBound(targetCapacity) {
    let low = 0;
    let high = this.roomsSortedByCapacity.length;
    while (low < high) {
      const mid = Math.floor((low + high) / 2);
      if (this.roomsSortedByCapacity[mid].capacity < targetCapacity) {
        low = mid + 1;
      } else {
        high = mid;
      }
    }
    return low;
  }

  suggestBestRooms(startTime, endTime, participants, options = {}) {
    const unavailableRoomIds = new Set();
    for (const booking of this.bookings) {
      if (booking.startTime < endTime && booking.endTime > startTime) {
        unavailableRoomIds.add(booking.roomId);
      }
    }

    const firstSuitableRoomIndex = this._binarySearchLowerBound(participants);
    if (firstSuitableRoomIndex === this.roomsSortedByCapacity.length) {
      return [];
    }

    const availableRooms = [];
    for (let i = firstSuitableRoomIndex; i < this.roomsSortedByCapacity.length; i++) {
      const room = this.roomsSortedByCapacity[i];
      if (!unavailableRoomIds.has(room.id)) {
        const score = this._calculateScore(room, participants, options);
        availableRooms.push({ ...room, score });
      }
    }

    return availableRooms.sort((a, b) => b.score - a.score);
  }

  _calculateScore(room, participants, options) {
    let score = 0;
    const capacityDifference = room.capacity - participants;
    score += 100 / (capacityDifference + 1);
    if (options.userFloor && room.floor === options.userFloor) {
      score += 50;
    }
    return score;
  }

  bookRoom(roomId, userId, startTime, endTime, participants) {
    const roomExists = this.roomsSortedByCapacity.some(r => r.id === roomId);
    if (!roomExists) {
      throw new Error("Room not found");
    }

    const newBooking = {
      id: this.bookings.length + 1,
      roomId,
      userId,
      startTime,
      endTime,
      participants
    };
    this.bookings.push(newBooking);
    console.log('New booking added:', newBooking);
    return newBooking;
  }
}

export default MeetingRoomScheduler;
