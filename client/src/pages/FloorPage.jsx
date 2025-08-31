// client/src/pages/FloorPage.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const FloorPage = () => {
  const { floorId } = useParams();
  const [floorData, setFloorData] = useState(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedDesk, setSelectedDesk] = useState(null);
  const [employeeName, setEmployeeName] = useState("");
  const [isUnassign, setIsUnassign] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Fetch floor data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`http://localhost:3000/floor/${floorId}`);
        if (!res.ok) throw new Error("Failed to fetch floor data");

        const data = await res.json();

        const desksOccupied = data.desks
          .map((desk) => (desk.employee ? desk.deskId : null))
          .filter(Boolean);

        const roomsOccupied = data.meetingRooms
          .map((room) => (room.isOccupied ? room.roomId : null))
          .filter(Boolean);

        setFloorData({
          floorId: data.floorId,
          desks: data.desks,
          meetingRooms: data.meetingRooms,
          desksOccupied,
          roomsOccupied,
        });
      } catch (err) {
        console.error("Error fetching floor data:", err);
      }
    };
    fetchData();
  }, [floorId]);

  // Assign desk
  const assignDesk = async () => {
    if (!employeeName.trim()) {
      setErrorMsg("*must add a name"); 
      return;
    }

    setErrorMsg("");
    try {
      const res = await fetch(
        `http://localhost:3000/floor/${floorId}/desks/${selectedDesk}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            employee: employeeName,
            admin: "AdminUser",
          }),
        }
      );

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to assign desk");
      }

      const updatedFloor = await res.json();
      const desksOccupied = updatedFloor.floor.desks
        .map((desk) => (desk.employee ? desk.deskId : null))
        .filter(Boolean);

      setFloorData((prev) => ({ ...prev, desksOccupied }));
      setShowModal(false);
      setEmployeeName("");
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  // Unassign desk
  const unassignDesk = async () => {
    try {
      const res = await fetch(
        `http://localhost:3000/floor/${floorId}/desks/${selectedDesk}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            employee: null,
            admin: "AdminUser"
          }),
        }
      );

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to unassign desk");
      }

      const updatedFloor = await res.json();
      const desksOccupied = updatedFloor.floor.desks
        .map((desk) => (desk.employee ? desk.deskId : null))
        .filter(Boolean);

      setFloorData((prev) => ({ ...prev, desksOccupied }));
      setShowModal(false);
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  if (!floorData) {
    return <p className="text-center mt-10 text-gray-600">Loading floor data...</p>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-10 relative">
      <h1 className="text-3xl font-bold text-center mb-8">Floor {floorId} Layout</h1>

      {/* Desks Section */}
      <div className="bg-white p-6 rounded-2xl shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">Desks</h2>
        <div className="grid grid-cols-4 gap-4 mb-6">
          {floorData.desks.map((desk) => {
            const occupied = floorData.desksOccupied.includes(desk.deskId);
            return (
              <div
                key={desk.deskId}
                onClick={() => {
                  setSelectedDesk(desk.deskId);
                  if (occupied) {
                    setIsUnassign(true); // show unassign modal
                  } else {
                    setIsUnassign(false); // show assign modal
                  }
                  setShowModal(true);
                }}
                className={`rounded-xl p-6 text-center font-medium shadow flex items-center justify-center transition-transform hover:scale-105 cursor-pointer ${
                  occupied ? "bg-red-500 text-white" : "bg-green-500 text-white"
                }`}
              >
                {desk.deskId}
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-80">
            {isUnassign ? (
              <>
                <h3 className="text-lg font-semibold mb-4">
                  Unassign Desk {selectedDesk}?
                </h3>
                <div className="flex justify-end gap-3">
                  <button
                    className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                    onClick={unassignDesk}
                  >
                    Yes
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold mb-4">
                  Assign Desk {selectedDesk}
                </h3>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded px-3 py-2 mb-2"
                  placeholder="Enter employee name"
                  value={employeeName}
                  onChange={(e) => setEmployeeName(e.target.value)}
                />
                {errorMsg && <p className="text-red-500 text-sm mb-2">{errorMsg}</p>}
                <div className="flex justify-end gap-3">
                  <button
                    className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    onClick={assignDesk}
                  >
                    Assign
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FloorPage;
