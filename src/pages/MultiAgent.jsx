import "./MultiAgent.css";

function MultiAgent() {
  return (
    <div className="arena">

      <div className="arena-header">

        <div>
          <p className="arena-tag">
            MULTI AGENT RACE
          </p>

          <h1>
            🏁 Multi-Agent Race Arena
          </h1>

          <p className="arena-description">
            Watch BFS, DFS and A* compete through
            the Treasure Hunt Maze in real time.
          </p>
        </div>

        <div className="arena-buttons">
          <button>Start Race</button>
          <button>Generate Maze</button>
        </div>

      </div>

      <div className="leaderboard">

        <div className="leader-card first">
          <h3>🥇 A*</h3>
          <span>0.09 ms</span>
        </div>

        <div className="leader-card second">
          <h3>🥈 BFS</h3>
          <span>0.14 ms</span>
        </div>

        <div className="leader-card third">
          <h3>🥉 DFS</h3>
          <span>0.27 ms</span>
        </div>

      </div>

      <div className="arena-main">

        <div className="maze-card">

          <h2>Treasure Hunt Maze</h2>

          <div className="maze-grid">

            {[...Array(64)].map((_, index) => (
              <div className="cell" key={index}>
                {index === 0 && "S"}
                {index === 27 && "T"}
                {index === 63 && "E"}
              </div>
            ))}

          </div>

        </div>

        <div className="race-card">

          <h2>Live Race</h2>

          <div className="race-item">

            <span>BFS</span>

            <div className="track">
              <div className="runner bfs"></div>
            </div>

          </div>

          <div className="race-item">

            <span>DFS</span>

            <div className="track">
              <div className="runner dfs"></div>
            </div>

          </div>

          <div className="race-item">

            <span>A*</span>

            <div className="track">
              <div className="runner astar"></div>
            </div>

          </div>

        </div>

      </div>

      <div className="analytics">

        <div className="metric">
          <h3>Visited Nodes</h3>
          <h1>128</h1>
        </div>

        <div className="metric">
          <h3>Execution Time</h3>
          <h1>0.09 ms</h1>
        </div>

        <div className="metric">
          <h3>Memory</h3>
          <h1>48 KB</h1>
        </div>

        <div className="metric">
          <h3>Path Length</h3>
          <h1>22</h1>
        </div>

      </div>

    </div>
  );
}

export default MultiAgent;