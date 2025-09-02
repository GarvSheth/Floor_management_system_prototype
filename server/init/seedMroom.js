import mongoose from 'mongoose';
import MeetingRoom from '../models/meetingRoom.js'; 

const roomsMetadata = [
    { name: 'The Pod', capacity: 2, floor: 1, amenities: [], status: 'Available' },
    { name: 'The Nook', capacity: 4, floor: 1, amenities: ['Whiteboard'], status: 'Available' },
    { name: 'Focus Point', capacity: 4, floor: 2, amenities: ['Whiteboard'], status: 'Available' },
    { name: 'Huddle Hub', capacity: 6, floor: 3, amenities: ['Whiteboard', 'TV'], status: 'Available' },
    { name: 'Innovation Lab', capacity: 8, floor: 2, amenities: ['Projector', 'Whiteboard'], status: 'Available' },
    { name: 'Synergy Space', capacity: 10, floor: 3, amenities: ['Projector', 'Whiteboard', 'Video Conferencing'], status: 'Available' },
    { name: 'Collaboration Corner', capacity: 10, floor: 1, amenities: ['TV', 'Whiteboard'], status: 'Available' },
    { name: 'Orion', capacity: 12, floor: 2, amenities: ['Projector', 'Whiteboard', 'Video Conferencing'], status: 'Available' },
    { name: 'The Boardroom', capacity: 16, floor: 3, amenities: ['Projector', 'Whiteboard', 'TV', 'Video Conferencing'], status: 'Available' },
    { name: 'The Summit', capacity: 20, floor: 2, amenities: ['Projector', 'Whiteboard', 'TV'], status: 'Available' },
    { name: 'Galaxy Hall', capacity: 25, floor: 1, amenities: ['Projector', 'Whiteboard', 'Podium'], status: 'Available' },
    { name: 'The Auditorium', capacity: 50, floor: 3, amenities: ['Projector', 'Podium', 'Microphones'], status: 'Available' },
];

const seedDatabase = async () => {
  try {
    const mongoURI = 'mongodb://127.0.0.1:27017/floor_management';
    if (!mongoURI) {
      throw new Error('MONGO_URI is not defined in your environment variables');
    }
    await mongoose.connect(mongoURI);
    console.log('Successfully connected to MongoDB.');
    console.log('Clearing old meeting room data...');
    await MeetingRoom.deleteMany({});
    console.log('Old data cleared.');

    console.log('Inserting new meeting room metadata...');
    await MeetingRoom.create(roomsMetadata);
    console.log('Database has been successfully seeded! ✅');

  } catch (error) {
    console.error('Error seeding the database: ❌', error);
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
  }
};

seedDatabase();

