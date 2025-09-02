import MeetingRoom from '../models/meetingRoom.js';
import Booking from '../models/booking.js';

class SchedulerEngine {
    async findAvailableRooms({ participants, startTime, endTime }) {
        if (typeof participants !== "number" || participants <= 0) {
            throw new Error("Participants must be a positive number.");
        }
        if (!startTime || !endTime) {
            throw new Error("Start and end time are required.");
        }
        if (new Date(startTime) >= new Date(endTime)) {
            throw new Error("End time must be after start time.");
        }
        console.log(`Finding rooms for ${participants} participants between ${startTime} - ${endTime}`);

        // --- STEP 1: Find conflicting bookings ---
        const conflictingBookings = await Booking.find({
            startTime: { $lt: endTime }, 
            endTime: { $gt: startTime },
        }).select("roomId");

        const unavailableRoomIds = new Set(
            conflictingBookings.map((b) => b.roomId.toString())
        );

        // --- STEP 2: Get candidate rooms (capacity >= participants, not in unavailable list) ---
        const availableRooms = await MeetingRoom.find({
            capacity: { $gte: participants },
            _id: { $nin: Array.from(unavailableRoomIds) },
        }).sort({ capacity: 1 });

        console.log(`Found ${availableRooms.length} available rooms.`);
        return availableRooms;
    }
}

export const scheduler = new SchedulerEngine();
