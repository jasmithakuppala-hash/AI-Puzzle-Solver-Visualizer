import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import MultiAgent from "./pages/MultiAgent";
import Teacher from "./pages/Teacher";
import Commentator from "./pages/Commentator";
import BackendExplorer from "./pages/BackendExplorer";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Home />} />

        <Route
          path="/multi-agent"
          element={<MultiAgent />}
        />

        <Route
          path="/teacher"
          element={<Teacher />}
        />

        <Route
          path="/commentator"
          element={<Commentator />}
        />

        <Route
          path="/backend"
          element={<BackendExplorer />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;