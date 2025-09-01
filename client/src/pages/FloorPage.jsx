// client/src/pages/FloorPage.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

// --- SVG Icons from the new UI design ---
const BackArrowIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
);

const UserIcon = () => (
    <svg className="w-6 h-6 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
);

const PlusIcon = () => (
    <svg className="w-6 h-6 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
);


const FloorPage = () => {
  const { floorId } = useParams();
  const [floorData, setFloorData] = useState(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedDesk, setSelectedDesk] = useState(null);
  const [employeeName, setEmployeeName] = useState("");
  const [isUnassign, setIsUnassign] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const updateFloorState = (data) => {
    setFloorData({
      floorId: data.floorId,
      desks: data.desks,
      meetingRooms: data.meetingRooms,
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`http://localhost:3000/floor/${floorId}`);
        if (!res.ok) throw new Error("Failed to fetch floor data");
        const data = await res.json();
        updateFloorState(data);
      } catch (err) {
        console.error("Error fetching floor data:", err);
      }
    };
    fetchData();
  }, [floorId]);

  const handleDeskClick = (desk) => {
    setSelectedDesk(desk); // Store the whole desk object
    if (desk.employee) {
      setEmployeeName(desk.employee);
      setIsUnassign(true);
    } else {
      setEmployeeName("");
      setIsUnassign(false);
      setErrorMsg("");
    }
    setShowModal(true);
  };
  
  const handleCloseModal = () => {
      setShowModal(false);
      setSelectedDesk(null);
      setEmployeeName("");
      setErrorMsg("");
  }

  const assignDesk = async () => {
    if (!employeeName.trim()) {
      setErrorMsg("*must add a name");
      return;
    }
    setErrorMsg("");
    try {
      const res = await fetch(
        `http://localhost:3000/floor/${floorId}/desks/${selectedDesk.deskId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ employee: employeeName, admin: "AdminUser" }),
        }
      );
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to assign desk");
      }
      const updatedData = await res.json();
      updateFloorState(updatedData.floor);
      handleCloseModal();
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const unassignDesk = async () => {
    try {
      const res = await fetch(
        `http://localhost:3000/floor/${floorId}/desks/${selectedDesk.deskId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ employee: null, admin: "AdminUser" }),
        }
      );
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to unassign desk");
      }
      const updatedData = await res.json();
      updateFloorState(updatedData.floor);
      handleCloseModal();
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  if (!floorData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-lg text-gray-500">Loading Floor Layout...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen">
        <div className="p-4 sm:p-6 md:p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <a href="/floor" className="bg-white text-gray-800 font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-gray-50 transition-colors flex items-center gap-2">
                    <BackArrowIcon />
                    Back to Dashboard
                </a>
                <h1 className="text-2xl md:text-3xl font-bold text-center text-gray-800">Floor {floorId} Layout</h1>
                <div className="w-44"></div> 
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Desks Section (takes up 2/3 of the space on large screens) */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-md">
                    <h2 className="text-2xl font-semibold mb-6 text-gray-700">Desks</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                        {floorData.desks.map((desk) => {
                            const isOccupied = !!desk.employee;
                            return (
                                <div key={desk.deskId} onClick={() => handleDeskClick(desk)} className="group cursor-pointer rounded-xl border-2 border-transparent hover:border-indigo-500 transition-all">
                                    <div className="bg-white rounded-xl shadow p-4 h-32 flex flex-col justify-between relative overflow-hidden">
                                        <div className={`absolute -top-1 -right-1 text-white text-xs font-bold px-2 py-0.5 rounded-bl-lg rounded-tr-lg ${isOccupied ? 'bg-red-500' : 'bg-green-500'}`}>
                                            {isOccupied ? "Occupied" : "Available"}
                                        </div>
                                        <div>
                                            <p className="font-bold text-lg text-gray-800">{desk.deskId}</p>
                                            {isOccupied && <p className="text-sm text-gray-500 truncate" title={desk.employee}>{desk.employee}</p>}
                                        </div>
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center self-end ${isOccupied ? 'bg-red-100' : 'bg-green-100'}`}>
                                            {isOccupied ? <UserIcon /> : <PlusIcon />}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-md">
                    <h2 className="text-2xl font-semibold mb-6 text-gray-700">Meeting Rooms</h2>
                    <div className="space-y-4">
                        {floorData.meetingRooms.map((room) => (
                             <div key={room.roomId} className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex justify-between items-center">
                                <div>
                                    <p className="font-bold text-gray-800">{room.roomId}</p>
                                    <p className="text-sm text-gray-500">Capacity: {room.capacity}</p>
                                </div>
                                <span className={`text-sm font-semibold px-3 py-1 rounded-full ${room.isOccupied ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                    {room.isOccupied ? "In Use" : "Available"}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>

        {/* Modal */}
        {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
                <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md transform transition-all">
                    {isUnassign ? (
                        // Unassign Desk Modal Content
                        <div>
                            <h3 className="text-2xl font-bold mb-2 text-gray-800">Unassign Desk {selectedDesk?.deskId}?</h3>
                            <p className="text-gray-600 mb-6">Are you sure you want to make this desk available?</p>
                            <div className="flex justify-end gap-4 mt-6">
                              <button onClick={handleCloseModal} className="bg-gray-200 text-gray-800 font-semibold px-6 py-2 rounded-lg hover:bg-gray-300 transition">Cancel</button>
                              <button onClick={unassignDesk} className="bg-red-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-red-700 transition">Yes, Unassign</button>
                            </div>
                        </div>
                    ) : (
                        // Assign Desk Modal Content
                        <div>
                            <h3 className="text-2xl font-bold mb-2 text-gray-800">Assign Desk {selectedDesk?.deskId}</h3>
                            <p className="text-gray-600 mb-6">Enter the employee's name to assign to this desk.</p>
                            <input
                              type="text"
                              value={employeeName}
                              onChange={(e) => setEmployeeName(e.target.value)}
                              className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-1 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                              placeholder="Enter employee name"
                            />
                            {errorMsg && <p className="text-red-500 text-sm mt-1 mb-2">{errorMsg}</p>}
                            <div className="flex justify-end gap-4 mt-6">
                              <button onClick={handleCloseModal} className="bg-gray-200 text-gray-800 font-semibold px-6 py-2 rounded-lg hover:bg-gray-300 transition">Cancel</button>
                              <button onClick={assignDesk} className="bg-indigo-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-indigo-700 transition">Assign</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        )}
    </div>
  );
};

export default FloorPage;