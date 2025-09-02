import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

// --- Icons ---
const BackArrowIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>
  </svg>
);

const HistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [deskId, setDeskId] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Read data from localStorage
    const storedHistory = localStorage.getItem("deskHistory");
    const storedDeskId = localStorage.getItem("deskHistoryDeskId");

    if (storedHistory && storedDeskId) {
      setHistory(JSON.parse(storedHistory));
      setDeskId(storedDeskId);
    } else {
      setHistory([]);
      setDeskId("Unknown");
    }

    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-lg text-gray-500">Loading commit history...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Link to="/floor" className="bg-white text-gray-800 font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-gray-50 transition-colors flex items-center gap-2">
          <BackArrowIcon /> Back to Dashboard
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Desk {deskId} Commit History</h1>
        <div className="w-44"></div>
      </div>

      {/* History List */}
      {history.length === 0 ? (
        <p className="text-gray-500">No commit history available for this desk.</p>
      ) : (
        <div className="space-y-4">
          {history.map((commit, index) => (
            <div key={commit.commitId || index} className="bg-white p-6 rounded-2xl shadow-md border-l-4 border-indigo-500 transition hover:shadow-lg">
              <div className="flex justify-between items-center mb-2">
                <p className="font-bold text-gray-800 text-lg">Commit: {commit.commitId}</p>
                <span className="text-sm text-gray-500">{commit.timestamp ? new Date(commit.timestamp).toLocaleString() : ""}</span>
              </div>
              <p className="text-gray-700 mb-2">{commit.message}</p>
              {commit.changes && commit.changes.length > 0 && (
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  {commit.changes.map((change, idx) => (
                    <div key={idx} className="mb-1">
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold">{change.field}</span> changed from <span className="text-red-500">{change.oldValue || "null"}</span> to <span className="text-green-500">{change.newValue || "null"}</span>
                      </p>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-sm text-gray-500 mt-2">Author: {commit.author?.name || "Unknown"}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
