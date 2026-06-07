import "./Navbar.css";

function Navbar() {
  return (
    <nav className="navbar">

      <div className="logo">
        AI Puzzle Solver
      </div>

      <ul className="nav-links">

        <li>Home</li>

        <li>Experiences</li>

        <li>Statistics</li>

        <li>About</li>

      </ul>

      <button className="nav-btn">
        Start Exploring
      </button>

    </nav>
  );
}

export default Navbar;