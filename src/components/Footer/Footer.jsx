import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">

      <h2>AI Puzzle Solver Visualizer</h2>

      <p>
        Learn BFS, DFS and A* through interactive
        Treasure Hunt experiences.
      </p>

      <div className="footer-links">

        <span>Multi-Agent Race</span>

        <span>Teacher Mode</span>

        <span>Commentator Mode</span>

        <span>Backend Explorer</span>

      </div>

      <p className="copyright">
        © 2026 AI Puzzle Solver Visualizer
      </p>

    </footer>
  );
}

export default Footer;