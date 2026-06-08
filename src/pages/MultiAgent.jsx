import { useEffect, useState } from "react";
import "./MultiAgent.css";

const GRID_SIZE = 8;
const CELL_COUNT = GRID_SIZE * GRID_SIZE;
const START_INDEX = 0;
const MARQUEE_MESSAGES = [
  "🏁 AI Championship Live",
  "💡 A* currently leading",
  "🤖 BFS exploring nearby caves",
  "🧭 DFS searching deeper tunnels",
  "💎 Diamond treasure detected",
  "🏆 Championship race in progress",
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
const manhattan = (a, b) => {
  const [ar, ac] = indexToRowCol(a);
  const [br, bc] = indexToRowCol(b);
  return Math.abs(ar - br) + Math.abs(ac - bc);
};

const getNeighbors = (index) => {
  const [row, col] = indexToRowCol(index);
  return [[row, col + 1], [row + 1, col], [row, col - 1], [row - 1, col]]
    .filter(([r, c]) => r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE)
    .map(([r, c]) => rowColToIndex(r, c));
};

const buildPath = (start, target) => {
  let current = start;
  const path = [start];
  const visited = new Set([start]);

  while (current !== target) {
    const candidates = shuffleArray(getNeighbors(current)).filter((neighbor) => !visited.has(neighbor));
    const closer = candidates.filter((neighbor) => manhattan(neighbor, target) <= manhattan(current, target));
    const next = closer.length ? closer[randomInt(0, closer.length - 1)] : candidates[randomInt(0, candidates.length - 1)];
    if (next === undefined) {
      break;
    }
    visited.add(next);
    path.push(next);
    current = next;
  }

  return path;
};

const buildOrders = (obstacles, treasure) => {
  const isBlocked = (index) => obstacles.has(index);
  const neighbors = (index) => getNeighbors(index).filter((neighbor) => !isBlocked(neighbor));

  const bfsOrder = [];
  {
    const visited = Array(CELL_COUNT).fill(false);
    const queue = [START_INDEX];
    visited[START_INDEX] = true;

    while (queue.length) {
      const current = queue.shift();
      bfsOrder.push(current);
      if (current === treasure) {
        break;
      }
      const nextNeighbors = shuffleArray(neighbors(current));
      nextNeighbors.forEach((neighbor) => {
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
      if (current === treasure) {
        break;
      }
      const nextNeighbors = shuffleArray(neighbors(current)).sort((a, b) => manhattan(b, treasure) - manhattan(a, treasure));
      nextNeighbors.forEach((neighbor) => stack.push(neighbor));
    }
  }

  const astarOrder = [];
  let astarPath = [];
  {
    const gScore = Array(CELL_COUNT).fill(Infinity);
    const fScore = Array(CELL_COUNT).fill(Infinity);
    const cameFrom = Array(CELL_COUNT).fill(null);
    const openSet = new Set([START_INDEX]);
    const open = [START_INDEX];

    gScore[START_INDEX] = 0;
    fScore[START_INDEX] = manhattan(START_INDEX, treasure);

    while (open.length) {
      open.sort((a, b) => fScore[a] - fScore[b] || a - b);
      const current = open.shift();
      openSet.delete(current);
      astarOrder.push(current);

      if (current === treasure) {
        break;
      }

      neighbors(current).forEach((neighbor) => {
        const tentativeG = gScore[current] + 1;
        if (tentativeG < gScore[neighbor]) {
          cameFrom[neighbor] = current;
          gScore[neighbor] = tentativeG;
          fScore[neighbor] = tentativeG + manhattan(neighbor, treasure);
          if (!openSet.has(neighbor)) {
            open.push(neighbor);
            openSet.add(neighbor);
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
  const candidates = shuffleArray(Array.from({ length: CELL_COUNT }, (_, index) => index).filter((index) => index !== START_INDEX));
  const treasure = candidates[0];
  const portal = candidates.find((index) => index !== treasure) || CELL_COUNT - 1;

  const pathToTreasure = buildPath(START_INDEX, treasure);
  const pathToPortal = buildPath(treasure, portal);
  const reserved = new Set([...pathToTreasure, ...pathToPortal, START_INDEX, treasure, portal]);

  const obstacleCount = randomInt(11, 16);
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
  const [raceStarted, setRaceStarted] = useState(false);
  const [raceComplete, setRaceComplete] = useState(false);
  const [winner, setWinner] = useState("");
  const [currentLeader, setCurrentLeader] = useState("");
  const [finishTimes, setFinishTimes] = useState({ bfs: null, dfs: null, astar: null });
  const [commentary, setCommentary] = useState("Ready for championship mode.");
  const [winnerTime, setWinnerTime] = useState("0.00");
  const [raceStartTime, setRaceStartTime] = useState(null);

  const { obstacles, treasure, portal, bfsOrder, dfsOrder, astarOrder, astarPath } = mazeConfig;
  const astarPathSet = new Set(astarPath);

  const bfsProgress = Math.round((bfsStep / Math.max(1, bfsOrder.length - 1)) * 100);
  const dfsProgress = Math.round((dfsStep / Math.max(1, dfsOrder.length - 1)) * 100);
  const astarProgress = Math.round((astarStep / Math.max(1, astarOrder.length - 1)) * 100);

  const bfsPosition = bfsOrder[Math.min(bfsStep, bfsOrder.length - 1)];
  const dfsPosition = dfsOrder[Math.min(dfsStep, dfsOrder.length - 1)];
  const astarPosition = astarOrder[Math.min(astarStep, astarOrder.length - 1)];

  const allFinished = Object.values(finishTimes).every((time) => time !== null);
  const championName = allFinished ? winner || currentLeader : currentLeader || "Awaiting";
  const championDescription = currentLeader
    ? allFinished
      ? `${currentLeader} is champion after every agent finished.`
      : `${currentLeader} reached the treasure first and leads.`
    : "Start the race to crown a champion.";

  const visitedCells = new Set();
  bfsOrder.slice(0, bfsStep + 1).forEach((index) => visitedCells.add(index));
  dfsOrder.slice(0, dfsStep + 1).forEach((index) => visitedCells.add(index));
  astarOrder.slice(0, astarStep + 1).forEach((index) => visitedCells.add(index));

  useEffect(() => {
    if (!raceStarted) return undefined;

    const bfsTimer = setInterval(() => {
      setBfsStep((prev) => Math.min(bfsOrder.length - 1, prev + 1));
    }, 160);

    const dfsTimer = setInterval(() => {
      setDfsStep((prev) => Math.min(dfsOrder.length - 1, prev + 1));
    }, 220);

    const astarTimer = setInterval(() => {
      setAstarStep((prev) => Math.min(astarOrder.length - 1, prev + 1));
    }, 130);

    return () => {
      clearInterval(bfsTimer);
      clearInterval(dfsTimer);
      clearInterval(astarTimer);
    };
  }, [raceStarted, bfsOrder.length, dfsOrder.length, astarOrder.length]);

  useEffect(() => {
    if (!raceStarted) return;

    setFinishTimes((prev) => {
      const next = { ...prev };
      if (bfsPosition === treasure && prev.bfs === null) next.bfs = Date.now();
      if (dfsPosition === treasure && prev.dfs === null) next.dfs = Date.now();
      if (astarPosition === treasure && prev.astar === null) next.astar = Date.now();
      return next;
    });
  }, [bfsPosition, dfsPosition, astarPosition, raceStarted, treasure]);

  useEffect(() => {
    if (!raceStarted || currentLeader) return;

    const firstFinisher = Object.entries(finishTimes).find(([, time]) => time !== null);
    if (firstFinisher) {
      const [leaderKey] = firstFinisher;
      const label = leaderKey === "astar" ? "A*" : leaderKey.toUpperCase();
      setCurrentLeader(label);
      setCommentary(`🏁 ${label} hit the treasure first and leads the championship.`);
    }
  }, [finishTimes, currentLeader, raceStarted]);

  useEffect(() => {
    if (!raceStarted || currentLeader) return;

    const leader = [
      { name: "A*", value: astarProgress },
      { name: "BFS", value: bfsProgress },
      { name: "DFS", value: dfsProgress },
    ].sort((a, b) => b.value - a.value)[0].name;

    if (leader === "A*") {
      setCommentary("💡 A* found a shortcut.");
    } else if (leader === "BFS") {
      setCommentary("🤖 BFS is exploring nearby caves.");
    } else {
      setCommentary("🧭 DFS is searching deeper tunnels.");
    }
  }, [astarProgress, bfsProgress, dfsProgress, raceStarted, currentLeader]);

  useEffect(() => {
    if (!allFinished || !currentLeader || winner) return;
    setWinner(currentLeader);
    setRaceComplete(true);
    if (raceStartTime) {
      setWinnerTime(((Date.now() - raceStartTime) / 10).toFixed(2));
    }
  }, [allFinished, currentLeader, raceStartTime, winner]);

  useEffect(() => {
    if (raceComplete && winner) {
      setCommentary(`🏆 ${winner} is champion after every agent finished.`);
    }
  }, [raceComplete, winner]);

  const startRace = () => {
    if (raceComplete) return;
    setRaceStarted(true);
    setRaceStartTime(Date.now());
    setCommentary("Race started: robots are moving through the crystal arena.");
  };

  const resetRace = () => {
    setRaceStarted(false);
    setRaceComplete(false);
    setWinner("");
    setCurrentLeader("");
    setFinishTimes({ bfs: null, dfs: null, astar: null });
    setWinnerTime("0.00");
    setCommentary("Ready for championship mode.");
    setBfsStep(0);
    setDfsStep(0);
    setAstarStep(0);
    setRaceStartTime(null);
  };

  const raceAgain = () => {
    resetRace();
    setRaceStarted(true);
    setRaceStartTime(Date.now());
    setCommentary("Race again: same maze, fresh challenge.");
  };

  const generateNewMaze = () => {
    resetRace();
    setMazeConfig(createMazeConfig());
    setCommentary("New maze generated: treasure hunt refreshed.");
  };

  const renderRobotBadges = (index) => {
    const robots = [];
    if (index === bfsPosition) robots.push({ emoji: "🤖", label: "bfs" });
    if (index === dfsPosition) robots.push({ emoji: "🧭", label: "dfs" });
    if (index === astarPosition) robots.push({ emoji: "💡", label: "astar" });
    if (!robots.length) return null;

    return (
      <div className="robot-stack">
        {robots.map((robot) => (
          <span key={robot.label} className={`robot-badge ${robot.label}`}>
            {robot.emoji}
          </span>
        ))}
      </div>
    );
  };

  const cells = Array.from({ length: CELL_COUNT }, (_, index) => {
    const isObstacle = obstacles.has(index);
    const isStart = index === START_INDEX;
    const isTreasure = index === treasure;
    const isPortal = index === portal;
    const visited = visitedCells.has(index);
    const isPath = astarPathSet.has(index);

    return (
      <div
        key={index}
        className={`cell ${isObstacle ? "obstacle" : isStart ? "start" : isTreasure ? "treasure" : isPortal ? "portal" : ""} ${visited ? "visited" : ""} ${isPath ? "astar-path" : ""}`}
      >
        {renderRobotBadges(index)}
        {isObstacle && <div className="cell-token obstacle">🪨</div>}
        {isStart && <div className="cell-token start">S</div>}
        {isTreasure && <div className="cell-token treasure">💎</div>}
        {isPortal && <div className="cell-token portal">🚪</div>}
      </div>
    );
  });

  return (
    <div className="arena">
      <div className="marquee-shell">
        <div className="marquee-track">
          {MARQUEE_MESSAGES.concat(MARQUEE_MESSAGES).map((message, index) => (
            <span key={`${message}-${index}`} className="marquee-item">
              {message}
            </span>
          ))}
        </div>
      </div>

      <div className="arena-top">
        <div className="page-copy">
          <p className="arena-tag">TREASURE HUNT ARENA</p>
          <h1>🏁 Multi-Agent Championship</h1>
          <p>
            Compact esports layout with a live maze race, agent strategy tips, and a winner popup for every
            treasure hunt challenge.
          </p>
        </div>
      </div>

      <div className="leaderboard">
        <div className={`leader-card ${allFinished ? "glow" : ""}`}>
          <span className="card-label">🏆 Treasure Hunter Champion</span>
          <h3>{championName}</h3>
          <p>{championDescription}</p>
        </div>

        <div className="leader-card blue">
          <span className="card-label">BFS Progress</span>
          <h3>{bfsProgress}%</h3>
          <p>Level-by-level exploration through the maze.</p>
        </div>

        <div className="leader-card purple">
          <span className="card-label">Race Status</span>
          <h3>{raceComplete ? "Finished" : raceStarted ? "Live" : "Ready"}</h3>
          <p>{commentary}</p>
        </div>
      </div>

      <div className="arena-grid">
        <div className="left-column">
          <section className="maze-panel">
            <div className="panel-header">
              <div>
                <span className="panel-label">CRYSTAL MAZE</span>
                <h2>8x8 Live Race Grid</h2>
              </div>
              <div className="panel-chip">solvable maze</div>
            </div>

            <div className="maze-shell">
              <div className="maze-grid">{cells}</div>
            </div>

            <div className="maze-key">
              <div className="legend-pill bfs">🤖 BFS</div>
              <div className="legend-pill dfs">🧭 DFS</div>
              <div className="legend-pill astar">💡 A*</div>
              <div className="legend-pill treasure">💎 Treasure</div>
              <div className="legend-pill portal">🚪 Portal</div>
              <div className="legend-pill obstacle">🪨 Rock</div>
            </div>

            <div className="button-group maze-actions">
              <button className="launch-btn" onClick={startRace}>
                🚀 Start Race
              </button>
              <button className="new-maze-btn" onClick={generateNewMaze}>
                🗺️ New Maze
              </button>
              <button className="reset-btn" onClick={resetRace}>
                🔄 Reset
              </button>
            </div>
          </section>

          <section className="metrics-panel">
            <div className="panel-header">
              <div>
                <span className="panel-label">RACE METRICS</span>
                <h2>Live Exploration Stats</h2>
              </div>
            </div>
            <div className="metrics-grid">
              <div className="metric-card">
                <span>Visited Nodes</span>
                <strong>{visitedCells.size}</strong>
              </div>
              <div className="metric-card">
                <span>Winner Time</span>
                <strong>{winnerTime} ms</strong>
              </div>
              <div className="metric-card">
                <span>Treasure Path</span>
                <strong>{astarPath.length}</strong>
              </div>
              <div className="metric-card">
                <span>Portal Location</span>
                <strong>{portal}</strong>
              </div>
            </div>
          </section>
        </div>

        <div className="right-column">
          <section className="race-panel">
            <div className="winner-card-panel">
              <span className="panel-label">WINNER CARD</span>
              <h3>{championName}</h3>
              <p>{championDescription}</p>
            </div>

            <div className="tracks">
              <article className="track-card bfs">
                <div className="track-title">
                  <span>🤖 BFS</span>
                  <strong>{bfsProgress}%</strong>
                </div>
                <p>Level-by-level exploration</p>
                <div className="track-bar">
                  <div className="track-fill bfs" style={{ width: `${bfsProgress}%` }} />
                </div>
              </article>

              <article className="track-card dfs">
                <div className="track-title">
                  <span>🧭 DFS</span>
                  <strong>{dfsProgress}%</strong>
                </div>
                <p>Deep-first exploration</p>
                <div className="track-bar">
                  <div className="track-fill dfs" style={{ width: `${dfsProgress}%` }} />
                </div>
              </article>

              <article className="track-card astar">
                <div className="track-title">
                  <span>💡 A*</span>
                  <strong>{astarProgress}%</strong>
                </div>
                <p>Heuristic guided search</p>
                <div className="track-bar">
                  <div className="track-fill astar" style={{ width: `${astarProgress}%` }} />
                </div>
              </article>
            </div>

            <div className="strategy-grid">
              <div className="strategy-pill">
                <strong>BFS Strategy</strong>
                <span>Level-by-level exploration</span>
              </div>
              <div className="strategy-pill">
                <strong>DFS Strategy</strong>
                <span>Deep-first exploration</span>
              </div>
              <div className="strategy-pill">
                <strong>A* Strategy</strong>
                <span>Heuristic guided search</span>
              </div>
            </div>

            <div className="commentary-card">
              <div className="commentary-head">
                <span>AI Commentary</span>
                <p>Live race analysis and algorithm tactics.</p>
              </div>
              <p>{commentary}</p>
            </div>
          </section>
        </div>
      </div>

      {raceComplete && winner ? (
        <div className="winner-modal">
          <div className="winner-dialog">
            <div className="modal-hero">
              <span>🏆</span>
            </div>
            <h2>TREASURE HUNTER CHAMPION</h2>
            <div className="modal-summary">
              <div>
                <span>Winner</span>
                <strong>{winner}</strong>
              </div>
              <div>
                <span>Completion Time</span>
                <strong>{winnerTime} ms</strong>
              </div>
              <div>
                <span>Visited Nodes</span>
                <strong>{visitedCells.size}</strong>
              </div>
              <div>
                <span>Path Length</span>
                <strong>{astarPath.length}</strong>
              </div>
            </div>
            <div className="modal-actions">
              <button className="launch-btn" onClick={raceAgain}>
                🔄 Race Again
              </button>
              <button className="new-maze-btn" onClick={generateNewMaze}>
                🗺️ New Maze
              </button>
            </div>
          </div>
          <div className="confetti-grid">
            {Array.from({ length: 16 }).map((_, index) => (
              <span key={index} className={`confetti-piece piece-${index + 1}`} />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default MultiAgent;
