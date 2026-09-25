import { useEffect, useState } from "react";
import "./MultiAgent.css";

const GRID_SIZE = 8;
const CELL_COUNT = GRID_SIZE * GRID_SIZE;
const START_INDEX = 0;
const MARQUEE_MESSAGES = [
  "🏁 Championship Live",
  "🤖 BFS exploring level by level",
  "🧭 DFS diving deeper into tunnels",
  "💡 A* chasing the shortest path",
  "💎 Diamond treasure detected",
  "🚪 Portal exit appears ahead",
];

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const shuffleArray = (array) => {
  const clone = [...array];
  for (let i = clone.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [clone[i], clone[j]] = [clone[j], clone[i]];
  }
  return clone;
};

const indexToRowCol = (index) => [Math.floor(index / GRID_SIZE), index % GRID_SIZE];
const rowColToIndex = (row, col) => row * GRID_SIZE + col;
const manhattan = (from, to) => {
  const [fr, fc] = indexToRowCol(from);
  const [tr, tc] = indexToRowCol(to);
  return Math.abs(fr - tr) + Math.abs(fc - tc);
};

const getNeighbors = (index) => {
  const [row, col] = indexToRowCol(index);
  const candidates = [
    [row, col + 1],
    [row + 1, col],
    [row, col - 1],
    [row - 1, col],
  ];
  return candidates
    .filter(([r, c]) => r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE)
    .map(([r, c]) => rowColToIndex(r, c));
};

const buildPath = (start, end) => {
  const path = [start];
  const visited = new Set([start]);
  let current = start;

  while (current !== end) {
    const neighbors = shuffleArray(getNeighbors(current)).filter((n) => !visited.has(n));
    if (!neighbors.length) break;
    neighbors.sort((a, b) => manhattan(a, end) - manhattan(b, end));
    const next = neighbors[0];
    visited.add(next);
    path.push(next);
    current = next;
  }

  return path;
};

const buildOrders = (obstacles, treasure) => {
  const isBlocked = (index) => obstacles.has(index);
  const accessible = (index) => getNeighbors(index).filter((neighbor) => !isBlocked(neighbor));

  const bfsOrder = [];
  {
    const visited = Array(CELL_COUNT).fill(false);
    const queue = [START_INDEX];
    visited[START_INDEX] = true;
    while (queue.length) {
      const current = queue.shift();
      bfsOrder.push(current);
      if (current === treasure) break;
      accessible(current).forEach((neighbor) => {
        if (!visited[neighbor]) {
          visited[neighbor] = true;
          queue.push(neighbor);
        }
      });
    }
  }

  const dfsOrder = [];
  {
    const visited = Array(CELL_COUNT).fill(false);
    const stack = [START_INDEX];
    while (stack.length) {
      const current = stack.pop();
      if (visited[current]) continue;
      visited[current] = true;
      dfsOrder.push(current);
      if (current === treasure) break;
      accessible(current)
        .sort((a, b) => manhattan(b, treasure) - manhattan(a, treasure))
        .forEach((neighbor) => stack.push(neighbor));
    }
  }

  const astarOrder = [];
  let astarPath = [];
  {
    const gScore = Array(CELL_COUNT).fill(Infinity);
    const fScore = Array(CELL_COUNT).fill(Infinity);
    const cameFrom = Array(CELL_COUNT).fill(null);
    const openSet = [START_INDEX];
    const openSetMap = new Set([START_INDEX]);

    gScore[START_INDEX] = 0;
    fScore[START_INDEX] = manhattan(START_INDEX, treasure);

    while (openSet.length) {
      openSet.sort((a, b) => fScore[a] - fScore[b]);
      const current = openSet.shift();
      openSetMap.delete(current);
      astarOrder.push(current);
      if (current === treasure) break;
      accessible(current).forEach((neighbor) => {
        const tentative = gScore[current] + 1;
        if (tentative < gScore[neighbor]) {
          cameFrom[neighbor] = current;
          gScore[neighbor] = tentative;
          fScore[neighbor] = tentative + manhattan(neighbor, treasure);
          if (!openSetMap.has(neighbor)) {
            openSetMap.add(neighbor);
            openSet.push(neighbor);
          }
        }
      });
    }

    if (gScore[treasure] < Infinity) {
      let current = treasure;
      while (current !== null) {
        astarPath.unshift(current);
        current = cameFrom[current];
      }
    }
  }

  return { bfsOrder, dfsOrder, astarOrder, astarPath };
};

const createMazeConfig = () => {
  const candidates = shuffleArray(
    Array.from({ length: CELL_COUNT }, (_, index) => index).filter((index) => index !== START_INDEX)
  );
  const treasure = candidates[0];
  const portal = candidates.find((index) => index !== treasure) ?? CELL_COUNT - 1;
  const pathToTreasure = buildPath(START_INDEX, treasure);
  const pathToPortal = buildPath(treasure, portal);
  const reserved = new Set([...pathToTreasure, ...pathToPortal, START_INDEX, treasure, portal]);

  const obstacleCount = randomInt(10, 14);
  const obstacleCandidates = shuffleArray(
    Array.from({ length: CELL_COUNT }, (_, index) => index).filter((index) => !reserved.has(index))
  );
  const obstacles = new Set(obstacleCandidates.slice(0, obstacleCount));

  const { bfsOrder, dfsOrder, astarOrder, astarPath } = buildOrders(obstacles, treasure);
  return { obstacles, treasure, portal, bfsOrder, dfsOrder, astarOrder, astarPath };
};

function MultiAgent() {
  const [mazeConfig, setMazeConfig] = useState(() => createMazeConfig());
  const [bfsStep, setBfsStep] = useState(0);
  const [dfsStep, setDfsStep] = useState(0);
  const [astarStep, setAstarStep] = useState(0);
  const [bfsProgress, setBfsProgress] = useState(0);
  const [dfsProgress, setDfsProgress] = useState(0);
  const [astarProgress, setAstarProgress] = useState(0);
  const [raceStarted, setRaceStarted] = useState(false);
  const [raceComplete, setRaceComplete] = useState(false);
  const [winner, setWinner] = useState("");
  const [currentLeader, setCurrentLeader] = useState("");
  const [finishTimes, setFinishTimes] = useState({ bfs: null, dfs: null, astar: null });
  const [commentary, setCommentary] = useState("Awaiting the championship start.");
  const [winnerTime, setWinnerTime] = useState("0.00");
  const [raceStartTime, setRaceStartTime] = useState(null);

  const { obstacles, treasure, portal, bfsOrder, dfsOrder, astarOrder, astarPath } = mazeConfig;
  const astarPathSet = new Set(astarPath);

  const maxBfsIndex = Math.max(bfsOrder.length - 1, 1);
  const maxDfsIndex = Math.max(dfsOrder.length - 1, 1);
  const maxAstarIndex = Math.max(astarOrder.length - 1, 1);

  const bfsPosition = bfsOrder[Math.min(bfsStep, bfsOrder.length - 1)];
  const dfsPosition = dfsOrder[Math.min(dfsStep, dfsOrder.length - 1)];
  const astarPosition = astarOrder[Math.min(astarStep, astarOrder.length - 1)];

  const bfsVisited = new Set(bfsOrder.slice(0, bfsStep + 1));
  const dfsVisited = new Set(dfsOrder.slice(0, dfsStep + 1));
  const astarVisited = new Set(astarOrder.slice(0, astarStep + 1));
  const visitedCells = new Set([...bfsVisited, ...dfsVisited, ...astarVisited]);

  const visitedCount = visitedCells.size;
  const championName = winner || currentLeader || "Awaiting";
  const championDescription = winner
    ? `${winner} has won the championship.`
    : currentLeader
    ? `${currentLeader} is currently in the lead.`
    : "Start the race to crown the champion.";

  useEffect(() => {
    if (!raceStarted || raceComplete) return undefined;

    const bfsTimer = setInterval(() => {
      setBfsStep((prev) => {
        const next = Math.min(prev + 1, bfsOrder.length - 1);
        setBfsProgress(Math.round((next / maxBfsIndex) * 100));
        return next;
      });
    }, 130);

    const dfsTimer = setInterval(() => {
      setDfsStep((prev) => {
        const next = Math.min(prev + 1, dfsOrder.length - 1);
        setDfsProgress(Math.round((next / maxDfsIndex) * 100));
        return next;
      });
    }, 180);

    const astarTimer = setInterval(() => {
      setAstarStep((prev) => {
        const next = Math.min(prev + 1, astarOrder.length - 1);
        setAstarProgress(Math.round((next / maxAstarIndex) * 100));
        return next;
      });
    }, 110);

    return () => {
      clearInterval(bfsTimer);
      clearInterval(dfsTimer);
      clearInterval(astarTimer);
    };
  }, [raceStarted, raceComplete, bfsOrder.length, dfsOrder.length, astarOrder.length, maxBfsIndex, maxDfsIndex, maxAstarIndex]);

  useEffect(() => {
    if (!raceStarted || raceStartTime === null) return;

    setFinishTimes((prev) => {
      const now = Date.now();
      const next = { ...prev };
      if (bfsPosition === treasure && prev.bfs === null) next.bfs = now - raceStartTime;
      if (dfsPosition === treasure && prev.dfs === null) next.dfs = now - raceStartTime;
      if (astarPosition === treasure && prev.astar === null) next.astar = now - raceStartTime;
      return next;
    });
  }, [bfsPosition, dfsPosition, astarPosition, raceStarted, raceStartTime, treasure]);

  useEffect(() => {
    if (!raceStarted || raceComplete) return;

    const lead = [
      { label: "A*", value: astarProgress },
      { label: "BFS", value: bfsProgress },
      { label: "DFS", value: dfsProgress },
    ].sort((a, b) => b.value - a.value)[0];

    if (!lead) return;
    if (lead.label === currentLeader) return;

    setCurrentLeader(lead.label);
    if (lead.label === "A*") {
      setCommentary("💡 A* discovered an efficient shortcut.");
    } else if (lead.label === "BFS") {
      setCommentary("🤖 BFS is exploring nearby corridors.");
    } else {
      setCommentary("🧭 DFS is diving deeper underground.");
    }
  }, [astarProgress, bfsProgress, dfsProgress, raceStarted, currentLeader, raceComplete]);

  useEffect(() => {
    if (!raceStarted) return;

    if (bfsPosition === treasure && finishTimes.bfs === null) {
      setCommentary("💎 Treasure discovered by BFS!");
    }
    if (dfsPosition === treasure && finishTimes.dfs === null) {
      setCommentary("💎 Treasure discovered by DFS!");
    }
    if (astarPosition === treasure && finishTimes.astar === null) {
      setCommentary("💎 Treasure discovered by A*!");
    }
  }, [bfsPosition, dfsPosition, astarPosition, raceStarted, treasure, finishTimes]);

  useEffect(() => {
    if (!raceStarted) return;
    const finished = Object.entries(finishTimes).filter(([, time]) => time !== null);
    if (!finished.length) return;

    const sorted = finished.sort((a, b) => a[1] - b[1]);
    const [winnerKey] = sorted[0];
    const label = winnerKey === "astar" ? "A*" : winnerKey.toUpperCase();

    if (winner === "") {
      setWinner(label);
      setCommentary(`🏆 ${label} wins the championship!`);
      setWinnerTime((sorted[0][1] / 1).toFixed(0));
    }
  }, [finishTimes, raceStarted, winner]);

  useEffect(() => {
    if (raceStarted && winner && !raceComplete) {
      setRaceComplete(true);
    }
  }, [raceStarted, winner, raceComplete]);

  const resetRace = () => {
    setMazeConfig(createMazeConfig());
    setRaceStarted(false);
    setRaceComplete(false);
    setWinner("");
    setCurrentLeader("");
    setFinishTimes({ bfs: null, dfs: null, astar: null });
    setBfsStep(0);
    setDfsStep(0);
    setAstarStep(0);
    setBfsProgress(0);
    setDfsProgress(0);
    setAstarProgress(0);
    setWinnerTime("0.00");
    setCommentary("Awaiting the championship start.");
    setRaceStartTime(null);
  };

  const startRace = () => {
    if (raceStarted) return;
    setRaceStarted(true);
    setRaceStartTime(Date.now());
    setCommentary("Race started: the treasure hunt is underway.");
  };

  const generateNewMaze = () => {
    resetRace();
    setCommentary("New arena generated for the next championship.");
  };

  const renderRobotBadges = (index) => {
    const badges = [];
    if (index === bfsPosition) badges.push({ emoji: "🤖", color: "bfs" });
    if (index === dfsPosition) badges.push({ emoji: "🧭", color: "dfs" });
    if (index === astarPosition) badges.push({ emoji: "💡", color: "astar" });
    if (!badges.length) return null;
    return (
      <div className="robot-badges">
        {badges.map((badge) => (
          <span key={`${badge.color}-${index}`} className={`robot-badge ${badge.color}`}>
            {badge.emoji}
          </span>
        ))}
      </div>
    );
  };

  const cells = Array.from({ length: CELL_COUNT }, (_, index) => {
    const isStart = index === START_INDEX;
    const isTreasure = index === treasure;
    const isPortal = index === portal;
    const isObstacle = obstacles.has(index);
    const visited = visitedCells.has(index);
    const isPath = raceComplete && astarPathSet.has(index);
    const cellClasses = [
      "cell",
      isStart && "start",
      isTreasure && "treasure",
      isPortal && "portal",
      isObstacle && "obstacle",
      visited && "visited",
      bfsVisited.has(index) && "visited-bfs",
      dfsVisited.has(index) && "visited-dfs",
      astarVisited.has(index) && "visited-astar",
      isPath && "astar-path",
    ]
      .filter(Boolean)
      .join(" ");

    const cellIcon = isStart
      ? "🤖"
      : isTreasure
      ? "💎"
      : isPortal
      ? "🚪"
      : isObstacle
      ? "🪨"
      : "";

    return (
      <div key={index} className={cellClasses}>
        {renderRobotBadges(index)}
        <div className="cell-label">{cellIcon}</div>
      </div>
    );
  });

  return (
    <div className="arena">
      <header className="arena-header">
        <div className="arena-title">
          <p className="arena-tag">MULTI-AGENT TREASURE HUNT</p>
          <h1>🏁 Multi-Agent Treasure Hunt Championship</h1>
          <p className="arena-description">
            Three algorithms compete inside a premium crystal maze. Watch BFS, DFS and A* chase the diamond and race to the portal.
          </p>
        </div>
      </header>

      <div className="arena-marquee">
        <div className="marquee-track">
          {MARQUEE_MESSAGES.map((message, index) => (
            <span key={`${message}-${index}`} className="marquee-item">
              {message}
            </span>
          ))}
        </div>
      </div>

      <main className="arena-grid">
        <section className="maze-panel">
          <div className="maze-panel-top">
            <div>
              <span className="panel-label">TREASURE HUNT ARENA</span>
              <h2>8x8 Crystal Maze</h2>
            </div>
            <div className="maze-actions">
              <button className="primary-btn" onClick={startRace} disabled={raceStarted}>
                🚀 Start Race
              </button>
              <button className="secondary-btn" onClick={generateNewMaze}>
                🗺️ New Maze
              </button>
              <button className="secondary-btn" onClick={resetRace}>
                🔄 Reset
              </button>
            </div>
          </div>

          <div className="maze-shell">{cells}</div>

          <div className="legend-row">
            <div className="legend-pill bfs">🤖 BFS Agent</div>
            <div className="legend-pill dfs">🧭 DFS Explorer</div>
            <div className="legend-pill astar">💡 A* Agent</div>
            <div className="legend-pill treasure">💎 Diamond Treasure</div>
            <div className="legend-pill portal">🚪 Portal Exit</div>
            <div className="legend-pill obstacle">🪨 Rock Obstacles</div>
          </div>

          <div className="metrics-panel">
            <div className="metrics-head">
              <span className="panel-label">PERFORMANCE METRICS</span>
              <h3>Execution Summary</h3>
            </div>
            <div className="metrics-grid">
              <div className="metric-card">
                <span>Visited Nodes</span>
                <strong>{visitedCount}</strong>
              </div>
              <div className="metric-card">
                <span>Completion Time</span>
                <strong>{winner ? `${winnerTime} ms` : "Pending"}</strong>
              </div>
              <div className="metric-card">
                <span>Memory Estimate</span>
                <strong>{Math.max(12, Math.round(visitedCount * 0.6))} MB</strong>
              </div>
              <div className="metric-card">
                <span>Path Length</span>
                <strong>{astarPath.length}</strong>
              </div>
            </div>
          </div>
        </section>

        <section className="command-panel">
          <div className="winner-card">
            <div className="winner-intro">
              <span className="panel-label">TREASURE HUNTER COMMAND CENTER</span>
              <h3>🏆 Champion Command</h3>
            </div>
            <p>{championDescription}</p>
            <div className="winner-stats">
              <div className="winner-stat">
                <span>Champion</span>
                <strong>{championName}</strong>
              </div>
              <div className="winner-stat">
                <span>Finish</span>
                <strong>{winner ? `${winnerTime} ms` : "TBD"}</strong>
              </div>
            </div>
          </div>

          <div className="track-list">
            <article className="race-track bfs">
              <div className="track-title-row">
                <span>🤖 BFS</span>
                <strong>{bfsProgress}%</strong>
              </div>
              <div className="track-line">
                <span className="track-icon">🤖</span>
                <span className="track-rail">
                  <span className="track-progress bfs" style={{ width: `${bfsProgress}%` }} />
                </span>
                <span className="track-icon goal">🏁</span>
              </div>
              <p>{finishTimes.bfs ? "Reached diamond" : "Exploring nearby tunnels"}</p>
            </article>
            <article className="race-track dfs">
              <div className="track-title-row">
                <span>🧭 DFS</span>
                <strong>{dfsProgress}%</strong>
              </div>
              <div className="track-line">
                <span className="track-icon">🧭</span>
                <span className="track-rail">
                  <span className="track-progress dfs" style={{ width: `${dfsProgress}%` }} />
                </span>
                <span className="track-icon goal">🏁</span>
              </div>
              <p>{finishTimes.dfs ? "Reached diamond" : "Diving deeper underground"}</p>
            </article>
            <article className="race-track astar">
              <div className="track-title-row">
                <span>💡 A*</span>
                <strong>{astarProgress}%</strong>
              </div>
              <div className="track-line">
                <span className="track-icon">💡</span>
                <span className="track-rail">
                  <span className="track-progress astar" style={{ width: `${astarProgress}%` }} />
                </span>
                <span className="track-icon goal">🏁</span>
              </div>
              <p>{finishTimes.astar ? "Reached diamond" : "Chasing the shortest route"}</p>
            </article>
          </div>

          <div className="commentary-panel">
            <div className="commentary-label">LIVE COMMAND FEED</div>
            <p>{commentary}</p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default MultiAgent;