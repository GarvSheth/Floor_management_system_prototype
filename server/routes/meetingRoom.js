import express from 'express';
import { scheduler } from '../services/schedularEngine.js'; 
import Room from '../models/meetingRoom.js';
import Booking from '../models/booking.js';

const router = express.Router();

router.get('/suggest', async (req, res) => {
    try {
        const { participants , startTime, endTime} = req.query;
        const capacity = participants;
        if (capacity === undefined) {
            return res.status(400).json({ message: 'Missing required query parameter: capacity.' });
        }

        const minCapacity = parseInt(capacity, 10);

        if (isNaN(minCapacity)) {
            return res.status(400).json({ message: 'Capacity must be a valid number.' });
        }

        const rooms = await scheduler.findAvailableRooms({ participants: minCapacity, startTime: startTime, endTime: endTime });

        res.status(200).json(rooms);

    } catch (error) {
        console.error("Error in GET /get route:", error);
        res.status(500).json({ message: error.message });
    }
});

router.post('/book', async (req, res) => {
    console.log(req.body);
    try {
        const { roomId, userId, startTime, endTime, numberOfParticipants } = req.body;

        if (!roomId || !userId || !startTime || !endTime || !numberOfParticipants) {
            return res.status(400).json({ message: 'Missing required fields in request body.' });
        }

        //Step 1:Update the room's availability(No Need as such)
        const updatedRoom = await Room.findByIdAndUpdate(
            roomId,
            { status: "occupied" },
            { new: true }
        );

        if (!updatedRoom) {
            return res.status(404).json({ message: 'Room not found.' });
        }

        //Step 2:Create a booking entry (based on schema)
        const newBooking = new Booking({
            roomId,
            userId,
            startTime,
            endTime,
            numberOfParticipants
        });

        await newBooking.save();

        res.status(200).json({
            message: `Room ${roomId} successfully booked by user ${userId}.`,
            room: updatedRoom,
            booking: newBooking
        });

    } catch (error) {
        console.error("Error in POST /book route:", error);
        res.status(500).json({ message: error.message });
    }
});
export default router;
