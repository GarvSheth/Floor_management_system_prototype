import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import FloorPage from "./pages/FloorPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/floor/:floorId" element={<FloorPage />} />
      </Routes>
    </Router>
  );
}

export default App;
