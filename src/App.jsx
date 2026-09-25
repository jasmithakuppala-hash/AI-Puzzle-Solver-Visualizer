import { HashRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import MultiAgent from "./pages/MultiAgent";
import Teacher from "./pages/Teacher";
import BackendExplorer from "./pages/BackendExplorer";

function App() {
  return (
    <HashRouter>
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

        <Route path="/backend" element={<BackendExplorer />} />

      </Routes>
    </HashRouter>
  );
}

export default App;