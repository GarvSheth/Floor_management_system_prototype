import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import FloorPage from "./pages/FloorPage";
import MainPage from "./pages/MainPage";
import LoginPage from "./pages/LoginPage";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage/>} />
        <Route path="/floor" element={
            <MainPage />
          } />
        <Route path="/floor/:floorId" element={
            <FloorPage />
        } />
      </Routes>
    </Router>
  );
}

export default App;
