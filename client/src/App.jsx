import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import FloorPage from "./pages/FloorPage";
import MainPage from "./pages/MainPage";
import LoginPage from "./pages/LoginPage";
import MeetingRoom from "./pages/MeetingRoom";
import History from "./pages/History";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage/>} />
        <Route path="/floor" element={<MainPage />} />
        <Route path="/floor/:floorId" element={<FloorPage />} />
        <Route path="/suggestMeetingRoom" element={<MeetingRoom />}/>
        <Route path="/history" element={< History/>}/>
      </Routes>
    </Router>
  );
}

export default App;
