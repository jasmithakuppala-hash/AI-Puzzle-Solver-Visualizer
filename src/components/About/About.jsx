import "./About.css";

function About() {
  return (
    <section className="about">

      <div className="about-left">

        <span>ABOUT PROJECT</span>

        <h2>
          Learn AI Search Algorithms Through
          Interactive Treasure Hunt Mazes
        </h2>

        <p>
          AI Puzzle Solver Visualizer is an educational platform
          designed to help students understand how BFS, DFS and A*
          explore paths, visit nodes and find optimal solutions.
        </p>

      </div>

      <div className="about-right">

        <div className="about-card">
          <h3>🎯 Goal</h3>
          <p>Visualize every algorithm decision.</p>
        </div>

        <div className="about-card">
          <h3>⚡ Speed</h3>
          <p>Compare execution performance.</p>
        </div>

        <div className="about-card">
          <h3>📚 Learn</h3>
          <p>Step-by-step algorithm explanation.</p>
        </div>

        <div className="about-card">
          <h3>🔬 Explore</h3>
          <p>Watch Queue, Stack and Visited Set live.</p>
        </div>

      </div>

    </section>
  );
}

export default About;