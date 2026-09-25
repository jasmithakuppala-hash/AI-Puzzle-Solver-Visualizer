import "./Hero.css";

function Hero() {
  return (
    <section id="hero" className="hero">

      <div className="hero-left">

        <span className="hero-tag">
          AI • Data Structures • Visualization
        </span>

        <h1>
          AI Puzzle Solver
          <br />
          <span>Visualizer</span>
        </h1>

        <p>
          Learn BFS, DFS and A* through interactive Treasure Hunt
          experiences. Compare algorithms, understand every decision
          and explore the backend data structures in real time.
        </p>

        <div className="hero-buttons">

          <button className="primary-btn">
            Start Exploring →
          </button>

          <button className="secondary-btn">
            Live Demo
          </button>

        </div>

        <div className="algorithm-tags">

          <span>BFS</span>

          <span>DFS</span>

          <span>A*</span>

          <span>Multi-Agent</span>

        </div>

      </div>

      <div className="hero-right">

        <div className="dashboard-card">

          <div className="card-header">

            <div>

              <h3>Simulation Ready</h3>

              <p>Treasure Hunt Maze</p>

            </div>

            <div className="status-dot"></div>

          </div>

          <div className="stats">

            <div className="stat">

              <span>Algorithm</span>

              <h2>BFS</h2>

            </div>

            <div className="stat">

              <span>Status</span>

              <h2>Ready</h2>

            </div>

            <div className="stat">

              <span>Performance</span>

              <h2>98%</h2>

            </div>

            <div className="stat">

              <span>Visualization</span>

              <h2>Live</h2>

            </div>

          </div>

        </div>

      </div>

    </section>
  );
}

export default Hero;