import React, { useState, useEffect } from "react";

const MeetingRoom = () => {
  const [rooms, setRooms] = useState([]);
  const [isBooking, setIsBooking] = useState(null);
  const [message, setMessage] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("suggestMeetingRoomData");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setRooms(parsed.rooms || parsed); // handle array directly
        setStartTime(parsed.startTime);
        setEndTime(parsed.endTime);
      } catch (err) {
        console.error("Error parsing saved meeting room data", err);
      }
    }
  }, []);

  const handleBookRoom = async (room) => {
    setIsBooking(room._id);
    setMessage(null);

    if (!startTime || !endTime) {
      setMessage({ type: "error", text: "Start time or end time is missing." });
      setIsBooking(null);
      return;
    }

    try {
      const res = await fetch(`http://localhost:3000/room/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId: room._id,
          userId: "admin",
          startTime, // use the times from localStorage
          endTime,
          numberOfParticipants: room.capacity,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to book the room.");

      // Update the room status locally
      setRooms((prevRooms) =>
        prevRooms.map((r) =>
          r._id === room._id ? { ...r, status: "Occupied" } : r
        )
      );

      setMessage({
        type: "success",
        text: `Successfully booked ${data.room?.name || "room"}`,
      });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setIsBooking(null);
    }
  };

  const getAvailability = (status) => {
    if (status === "Available") return { text: "Available", color: "text-green-600" };
    if (status === "Occupied") return { text: "Occupied", color: "text-red-600" };
    return { text: "Unknown", color: "text-gray-600" };
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Suggested Meeting Rooms
        </h1>

        {message && (
          <div
            className={`mb-6 p-4 rounded-lg text-center font-medium ${
              message.type === "success"
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

        {rooms.length === 0 ? (
          <p className="text-gray-600">
            No suggestions available. Try running Quick Book again.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {rooms.map((room) => {
              const availability = getAvailability(room.status);

              return (
                <div
                  key={room._id || room.id}
                  className="bg-white shadow-md rounded-xl p-6 border border-gray-200 flex flex-col justify-between"
                >
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800">
                      {room.name || "Meeting Room"}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Capacity: {room.capacity || "N/A"} people
                    </p>
                    <p className="text-sm text-gray-500">
                      Availability:{" "}
                      <span className={`font-semibold ${availability.color}`}>
                        {availability.text}
                      </span>
                    </p>
                  </div>

                  <button
                    onClick={() => handleBookRoom(room)}
                    disabled={isBooking === (room._id || room.id)}
                    className="mt-4 w-full bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-indigo-700 disabled:bg-indigo-300 transition-colors"
                  >
                    {isBooking === (room._id || room.id)
                      ? "Booking..."
                      : "Book This Room"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MeetingRoom;
