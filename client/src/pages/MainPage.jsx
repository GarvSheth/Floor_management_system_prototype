import React, { useState, useEffect } from 'react';

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

const IconCalendar = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
);


const CopyButton = ({ textToCopy }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    const textArea = document.createElement('textarea');
    textArea.value = textToCopy;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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

const getFormattedTime = (date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
};


const QuickBooker = () => {
  const now = new Date();
  const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

  const [details, setDetails] = useState({
    participants: 4,
    startTime: getFormattedTime(now),
    endTime: getFormattedTime(oneHourLater),
  });
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState({ message: '', isError: false });

  const handleChange = (e) => {
    setDetails({ ...details, [e.target.name]: e.target.value });
  };

  const handleAutoBook = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setResult({ message: '', isError: false });

    const today = new Date().toISOString().split('T')[0];
    const startDateTime = new Date(`${today}T${details.startTime}`);
    const endDateTime = new Date(`${today}T${details.endTime}`);
    
    if (startDateTime >= endDateTime) {
      setResult({ message: 'Error: End time must be after start time.', isError: true });
      setIsLoading(false);
      return;
    }

    try {
      const params = new URLSearchParams({
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        participants: parseInt(details.participants, 10), 
        userId: 'admin', 
      });

      const res = await fetch(`http://localhost:3000/room/suggest?${params.toString()}`);
      const data = await res.json();
      console.log(data);
      if (!res.ok) {
        throw new Error(data.message || 'Failed to auto-book a room.');
      }

      const saveData = {
        rooms: data,           
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString()
      };
      
      localStorage.setItem('suggestMeetingRoomData', JSON.stringify(saveData));
      window.location.href = `/suggestMeetingRoom`;

    } catch (err) {
      setResult({ message: err.message, isError: true });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md h-full">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <IconCalendar /> Quick Book a Meeting Room for Today
      </h2>
      <form onSubmit={handleAutoBook} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="participants" className="block text-sm font-medium text-gray-700 mb-1">Participants</label>
            <input type="number" name="participants" value={details.participants} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" min="1"/>
          </div>
          <div>
            <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
            <input type="time" name="startTime" value={details.startTime} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"/>
          </div>
           <div>
            <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
            <input type="time" name="endTime" value={details.endTime} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"/>
          </div>
        </div>
        <button type="submit" disabled={isLoading} className="w-full bg-green-600 text-white font-bold py-2.5 rounded-lg shadow-sm hover:bg-green-700 disabled:bg-green-300 transition-colors">
          Suggest Meeting Room
        </button>
        {result.message && (
          <div className={`text-center p-3 rounded-lg mt-4 ${result.isError ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-800'}`}>
            {result.message}
          </div>
        )}
      </form>
    </div>
  );
};


const Dashboard = ({ floors, isLoadingFloors, floorsError }) => {
  const [searchDeskId, setSearchDeskId] = useState("");
  const [history, setHistory] = useState(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState(null);
  
  const [revertDeskId, setRevertDeskId] = useState("");
  const [revertCommitId, setRevertCommitId] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchDeskId) return;

    setIsLoadingHistory(true);
    setHistoryError(null);
    setHistory(null);

    try {
      const res = await fetch(`http://localhost:3000/history/${searchDeskId}`);
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to fetch history');
      }
      const data = await res.json();

      // Store history in localStorage
      localStorage.setItem('deskHistory', JSON.stringify(data.history || []));
      localStorage.setItem('deskHistoryDeskId', searchDeskId);

      // Redirect to history page
      window.location.href = `/history`;
    } catch (err) {
      setHistoryError(err.message);
    } finally {
      setIsLoadingHistory(false);
    }
  };
  
  const handleRevert = async (e) => {
  e.preventDefault();

  const deskId = localStorage.getItem('deskHistoryDeskId'); 
  if (!deskId || !revertCommitId) {
    alert("Please search a desk first and provide a Commit ID to revert.");
    return;
  }

  const isConfirmed = true; 

  if (isConfirmed) {
    try {
      const res = await fetch('http://localhost:3000/history/rollback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deskId,
          commitId: revertCommitId,
          admin: { id: 'admin-ui', name: 'Admin UI User' }
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to revert');
      }

      alert(`Revert action for ${deskId} has been successful.`);
      setRevertCommitId(""); // reset only commit input
    } catch (err) {
      alert(`Revert failed: ${err.message}`);
    }
  }
};

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-8">
      {/* Floor Selection Card */}
      <div className="bg-white p-6 rounded-2xl shadow-md">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">Select a Floor to Design</h2>
        {isLoadingFloors && <p className="text-gray-500">Loading floors...</p>}
        {floorsError && <p className="text-red-500">{floorsError}</p>}
        {floors && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {floors.map(floorNum => (
                <a 
                  key={floorNum} 
                  href={`/floor/${floorNum}`} 
                  className="bg-indigo-600 text-center text-white font-bold py-4 rounded-xl shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform transform hover:scale-105"
                >
                  Floor {floorNum}
                </a>
            ))}
            </div>
        )}
      </div>

      {/* Grid container for side-by-side components */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <QuickBooker />

        {/* History Search Card */}
        <div className="bg-white p-6 rounded-2xl shadow-md">
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
            {isLoadingHistory && <p className="text-center text-gray-600">Loading history...</p>}
            {historyError && <p className="text-center text-red-600 bg-red-50 p-3 rounded-lg">{historyError}</p>}
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
      </div>

      {/* Revert Section Card */}
      <div className="bg-white p-6 rounded-2xl shadow-md">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <IconRotateCcw /> Revert to a Commit
        </h2>
        <p className="text-sm text-gray-600 mb-4">
            Use the history search to find the Commit ID you want to revert to. This will restore the desk's state to that specific version.
        </p>
        <form onSubmit={handleRevert} className="space-y-4">
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
  );
};

export default function App() {
  const [floors, setFloors] = useState([]);
  const [isLoadingFloors, setIsLoadingFloors] = useState(true);
  const [floorsError, setFloorsError] = useState(null);

  useEffect(() => {
    const fetchFloors = async () => {
      try {
        const res = await fetch('http://localhost:3000/floor');
        if (!res.ok) {
          throw new Error('Could not fetch floor data.');
        }
        const data = await res.json();
        setFloors(data);
      } catch (err) {
        setFloorsError(err.message);
      } finally {
        setIsLoadingFloors(false);
      }
    };
    fetchFloors();
  }, []); 

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
        <Dashboard floors={floors} isLoadingFloors={isLoadingFloors} floorsError={floorsError} />
      </main>
    </div>
  );
}

