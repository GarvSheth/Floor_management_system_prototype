import React, { useState, useEffect } from 'react';

// --- Mock Data ---
// In a real app, this would come from an API call
const MOCK_FLOORS = [1, 2, 5, 12];

const MOCK_HISTORY = {
  "D-2-15": [
    {
      commitId: "654a7b8c9d0e1f2a3b4c5d6e",
      parentId: "654a7b8c9d0e1f2a3b4c5d6d",
      author: { id: "admin-jane", name: "Jane Doe" },
      message: "Assigned to new marketing hire.",
      changes: [{ floor: 2, entityId: "D-2-15", field: "employee", oldValue: null, newValue: "Alice Johnson" }],
      timestamp: "2025-08-31T10:30:00Z"
    },
    {
      commitId: "654a7b8c9d0e1f2a3b4c5d6d",
      parentId: "654a7b8c9d0e1f2a3b4c5d6c",
      author: { id: "admin-john", name: "John Smith" },
      message: "Desk moved to hot-desking pool.",
      changes: [{ floor: 2, entityId: "D-2-15", field: "status", oldValue: "permanent", newValue: "hot-desk" }],
      timestamp: "2025-08-25T15:00:00Z"
    }
  ],
  "D-1-4": [
    {
      commitId: "a1b2c3d4e5f6a7b8c9d0e1f2",
      parentId: "z9y8x7w6v5u4t3s2r1q0p9o8",
      author: { id: "admin-sara", name: "Sara Lee" },
      message: "Vacated by previous employee.",
      changes: [{ floor: 1, entityId: "D-1-4", field: "employee", oldValue: "Tom Williams", newValue: null }],
      timestamp: "2025-09-01T09:00:00Z"
    }
  ]
};

// --- Helper Components & Icons ---

const IconSearch = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const IconClipboard = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
  </svg>
);

const IconRotateCcw = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 2v6h6"></path><path d="M3 13a9 9 0 1 0 3-7.7L3 8"></path>
    </svg>
);

const CopyButton = ({ textToCopy }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    // A temporary textarea is created to hold the text, selected, and then copied.
    // This is a common workaround for copying text in various browser environments.
    const textArea = document.createElement('textarea');
    textArea.value = textToCopy;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
    document.body.removeChild(textArea);
  };

  return (
    <button onClick={handleCopy} className="p-1.5 rounded-md hover:bg-gray-200 transition-colors">
      {copied ? <span className="text-xs text-green-600">Copied!</span> : <IconClipboard />}
    </button>
  );
};

// --- Main Application Components ---

const Dashboard = ({ onSelectFloor, floors }) => {
  const [searchDeskId, setSearchDeskId] = useState("");
  const [history, setHistory] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [revertDeskId, setRevertDeskId] = useState("");
  const [revertCommitId, setRevertCommitId] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchDeskId) return;
    
    setIsLoading(true);
    setError(null);
    setHistory(null);
    
    // Simulate API call
    setTimeout(() => {
      const results = MOCK_HISTORY[searchDeskId];
      if (results) {
        setHistory(results);
      } else {
        setError(`No history found for desk: ${searchDeskId}`);
      }
      setIsLoading(false);
    }, 1000);
  };
  
  const handleRevert = (e) => {
      e.preventDefault();
      if (!revertDeskId || !revertCommitId) {
          alert("Please provide both a Desk ID and a Commit ID to revert.");
          return;
      }
      // Use window.confirm for a simple confirmation dialog.
      // In a real app, a custom modal component would be better for UI/UX.
      const isConfirmed = window.confirm(
          `Are you sure you want to revert desk "${revertDeskId}" to the state of commit "${revertCommitId}"?\n\nThis action cannot be undone.`
      );
      
      if(isConfirmed) {
          console.log(`REVERTING desk ${revertDeskId} to commit ${revertCommitId}`);
          // Here you would make an API call to your backend's revert endpoint
          alert(`Revert action for ${revertDeskId} has been initiated.`);
          setRevertDeskId("");
          setRevertCommitId("");
      }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-8">
      {/* Floor Selection Card */}
      <div className="bg-white p-6 rounded-2xl shadow-md">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">Select a Floor to Design</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {floors.map(floorNum => (
            <button key={floorNum} onClick={() => onSelectFloor(floorNum)} className="bg-indigo-600 text-white font-bold py-4 rounded-xl shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform transform hover:scale-105">
              Floor {floorNum}
            </button>
          ))}
        </div>
      </div>

      {/* History & Revert Card */}
      <div className="bg-white p-6 rounded-2xl shadow-md">
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* History Search Section */}
            <div>
               <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">View History</h2>
               <form onSubmit={handleSearch} className="flex items-center gap-2">
                  <input 
                    type="text" 
                    value={searchDeskId}
                    onChange={(e) => setSearchDeskId(e.target.value)}
                    placeholder="Enter Desk ID (e.g., D-2-15)" 
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
                  />
                  <button type="submit" className="bg-indigo-600 text-white p-2.5 rounded-lg shadow-sm hover:bg-indigo-700 flex items-center justify-center transition-colors">
                    <IconSearch />
                  </button>
               </form>
               
                {/* History Results Display */}
                <div className="mt-6 space-y-4">
                  {isLoading && <p className="text-center text-gray-600">Loading history...</p>}
                  {error && <p className="text-center text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>}
                  {history && (
                    <div className="border-t pt-4">
                      <h3 className="font-bold text-lg mb-2">History for <span className="text-indigo-600">{searchDeskId}</span></h3>
                      {history.map(commit => (
                        <div key={commit.commitId} className="bg-gray-50 p-4 rounded-lg mb-3 border border-gray-200">
                          <div className="flex justify-between items-start">
                             <div>
                                <p className="font-semibold text-gray-800">{commit.message}</p>
                                <p className="text-sm text-gray-500">by {commit.author.name} on {new Date(commit.timestamp).toLocaleDateString()}</p>
                             </div>
                             <div className="flex items-center gap-2 text-xs text-gray-400 font-mono">
                                {commit.commitId.substring(0, 12)}...
                                <CopyButton textToCopy={commit.commitId} />
                             </div>
                          </div>
                          <div className="mt-2 text-sm bg-white p-2 rounded border">
                            <p><span className="font-semibold">Field:</span> {commit.changes[0].field}</p>
                            <p><span className="font-semibold text-red-600">Old:</span> {JSON.stringify(commit.changes[0].oldValue) || 'none'}</p>
                            <p><span className="font-semibold text-green-600">New:</span> {JSON.stringify(commit.changes[0].newValue) || 'none'}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
            </div>
            
            {/* Revert Section */}
            <div className="border-t lg:border-t-0 lg:border-l lg:pl-8 pt-8 lg:pt-0">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <IconRotateCcw /> Revert to a Commit
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                    Use the history search to find the Commit ID you want to revert to. This will restore the desk's state to that specific version.
                </p>
                <form onSubmit={handleRevert} className="space-y-4">
                    <div>
                        <label htmlFor="revertDeskId" className="block text-sm font-medium text-gray-700 mb-1">Desk ID</label>
                        <input
                            id="revertDeskId"
                            type="text"
                            value={revertDeskId}
                            onChange={e => setRevertDeskId(e.target.value)}
                            placeholder="Desk ID to revert (e.g., D-1-4)"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 transition-shadow"
                        />
                    </div>
                    <div>
                        <label htmlFor="revertCommitId" className="block text-sm font-medium text-gray-700 mb-1">Commit ID</label>
                        <input
                            id="revertCommitId"
                            type="text"
                            value={revertCommitId}
                            onChange={e => setRevertCommitId(e.target.value)}
                            placeholder="Paste the Commit ID here"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 transition-shadow"
                        />
                    </div>
                    <button type="submit" className="w-full bg-amber-500 text-white font-bold py-2.5 rounded-lg shadow-sm hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors">
                        Revert Desk
                    </button>
                </form>
            </div>
         </div>
      </div>
    </div>
  );
};

const FloorDesigner = ({ floorId, onBack }) => {
  // This is a placeholder for the actual floor designing UI
  return (
    <div className="p-8">
      <button onClick={onBack} className="mb-8 bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">
        &larr; Back to Dashboard
      </button>
      <h1 className="text-4xl font-bold text-center text-gray-800">Floor {floorId} Designer</h1>
      <p className="text-center text-gray-600 mt-2">This is where the floor layout and desk arrangement would be managed.</p>
      
      {/* Placeholder grid for desks */}
      <div className="mt-10 grid grid-cols-8 gap-4 bg-white p-6 rounded-2xl shadow-lg">
        {Array.from({ length: 32 }).map((_, i) => (
          <div key={i} className="h-20 bg-indigo-100 border-2 border-dashed border-indigo-300 rounded-lg flex items-center justify-center text-indigo-500 font-mono">
            Desk {i+1}
          </div>
        ))}
      </div>
    </div>
  );
};


export default function App() {
  const [view, setView] = useState('dashboard'); // 'dashboard' or 'designer'
  const [currentFloor, setCurrentFloor] = useState(null);

  const handleSelectFloor = (floorId) => {
    setCurrentFloor(floorId);
    setView('designer');
  };

  const handleBackToDashboard = () => {
    setView('dashboard');
    setCurrentFloor(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Intelligent Floor Plan Manager
          </h1>
        </div>
      </header>
      <main>
        {view === 'dashboard' && <Dashboard onSelectFloor={handleSelectFloor} floors={MOCK_FLOORS} />}
        {view === 'designer' && <FloorDesigner floorId={currentFloor} onBack={handleBackToDashboard} />}
      </main>
    </div>
  );
}
