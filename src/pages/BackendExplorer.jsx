import { useEffect, useRef, useState, useCallback } from "react";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import "./BackendExplorer.css";

// ─── Maze config ─────────────────────────────────────────────────────────────
const GRID_SIZE = 8;
const CELL_COUNT = GRID_SIZE * GRID_SIZE;
const START_INDEX = 0;

const indexToRowCol = (i) => [Math.floor(i / GRID_SIZE), i % GRID_SIZE];
const rowColToIndex = (r, c) => r * GRID_SIZE + c;
const manhattan = (a, b) => {
  const [ar, ac] = indexToRowCol(a);
  const [br, bc] = indexToRowCol(b);
  return Math.abs(ar - br) + Math.abs(ac - bc);
};
const getNeighbors = (i) => {
  const [r, c] = indexToRowCol(i);
  return [[r, c + 1], [r + 1, c], [r, c - 1], [r - 1, c]]
    .filter(([nr, nc]) => nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE)
    .map(([nr, nc]) => rowColToIndex(nr, nc));
};
const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
const buildPath = (start, end) => {
  const path = [start];
  const visited = new Set([start]);
  let cur = start;
  while (cur !== end) {
    const nb = shuffle(getNeighbors(cur)).filter((n) => !visited.has(n));
    if (!nb.length) break;
    nb.sort((a, b) => manhattan(a, end) - manhattan(b, end));
    const next = nb[0];
    visited.add(next);
    path.push(next);
    cur = next;
  }
  return path;
};
const createMaze = () => {
  const all = Array.from({ length: CELL_COUNT }, (_, i) => i).filter((i) => i !== START_INDEX);
  const cands = shuffle(all);
  const treasure = cands[0];
  const portal = cands.find((i) => i !== treasure) ?? CELL_COUNT - 1;
  const p1 = buildPath(START_INDEX, treasure);
  const p2 = buildPath(treasure, portal);
  const reserved = new Set([...p1, ...p2, START_INDEX, treasure, portal]);
  const obsCands = shuffle(all.filter((i) => !reserved.has(i)));
  const obstacles = new Set(obsCands.slice(0, 12));
  return { treasure, portal, obstacles };
};

const fmtCell = (idx) => {
  const [r, c] = indexToRowCol(idx);
  return `(${r},${c})`;
};

// ─── BFS ─────────────────────────────────────────────────────────────────────
const buildBFSSteps = (obstacles, treasure) => {
  const steps = [];
  const visited = Array(CELL_COUNT).fill(false);
  const parent = Array(CELL_COUNT).fill(null);
  let queue = [START_INDEX];
  visited[START_INDEX] = true;
  const visitedSet = new Set([START_INDEX]);

  while (queue.length) {
    const cur = queue.shift();
    const newQueue = [...queue];

    steps.push({
      current: cur,
      visited: new Set(visitedSet),
      queue: [...newQueue],
      stack: null,
      pq: null,
      operation: `Dequeued ${fmtCell(cur)}`,
      log: `🤖 BFS dequeued node ${fmtCell(cur)} from front of queue`,
      parent: { ...Object.fromEntries(Object.entries(parent).filter(([, v]) => v !== null)) },
      gCost: null, hCost: null, fCost: null,
    });

    if (cur === treasure) break;

    const neighbors = getNeighbors(cur).filter((n) => !visited[n] && !obstacles.has(n));
    neighbors.forEach((n) => {
      visited[n] = true;
      visitedSet.add(n);
      parent[n] = cur;
      queue.push(n);
      steps.push({
        current: cur,
        visited: new Set(visitedSet),
        queue: [...queue],
        stack: null,
        pq: null,
        operation: `Enqueued ${fmtCell(n)}`,
        log: `🤖 BFS added ${fmtCell(n)} to queue`,
        parent: { ...Object.fromEntries(Object.entries(parent).filter(([, v]) => v !== null)) },
        gCost: null, hCost: null, fCost: null,
      });
    });
  }

  const path = [];
  let c = treasure;
  while (c !== null) { path.unshift(c); c = parent[c]; }

  if (steps.length) {
    steps[steps.length - 1].finalPath = new Set(path);
    steps[steps.length - 1].operation = `Found treasure! Path length: ${path.length}`;
    steps[steps.length - 1].log = `🏆 BFS found treasure at ${fmtCell(treasure)}! Shortest path: ${path.length} nodes`;
  }

  return steps;
};

// ─── DFS ─────────────────────────────────────────────────────────────────────
const buildDFSSteps = (obstacles, treasure) => {
  const steps = [];
  const visited = Array(CELL_COUNT).fill(false);
  const parent = Array(CELL_COUNT).fill(null);
  let stack = [START_INDEX];
  const visitedSet = new Set();

  while (stack.length) {
    const cur = stack[stack.length - 1];

    if (visited[cur]) {
      stack.pop();
      steps.push({
        current: cur,
        visited: new Set(visitedSet),
        queue: null,
        stack: [...stack],
        pq: null,
        operation: `Popped ${fmtCell(cur)} (already visited)`,
        log: `🧭 DFS popped ${fmtCell(cur)} — already visited, backtracking`,
        parent: {},
        gCost: null, hCost: null, fCost: null,
      });
      continue;
    }

    visited[cur] = true;
    visitedSet.add(cur);
    stack.pop();

    steps.push({
      current: cur,
      visited: new Set(visitedSet),
      queue: null,
      stack: [...stack],
      pq: null,
      operation: `Popped & visited ${fmtCell(cur)}`,
      log: `🧭 DFS popped ${fmtCell(cur)} from top of stack`,
      parent: {},
      gCost: null, hCost: null, fCost: null,
    });

    if (cur === treasure) break;

    const neighbors = getNeighbors(cur)
      .filter((n) => !visited[n] && !obstacles.has(n))
      .sort((a, b) => manhattan(b, treasure) - manhattan(a, treasure));

    neighbors.forEach((n) => {
      parent[n] = cur;
      stack.push(n);
      steps.push({
        current: cur,
        visited: new Set(visitedSet),
        queue: null,
        stack: [...stack],
        pq: null,
        operation: `Pushed ${fmtCell(n)}`,
        log: `🧭 DFS pushed ${fmtCell(n)} onto stack`,
        parent: {},
        gCost: null, hCost: null, fCost: null,
      });
    });
  }

  const path = [];
  let c = treasure;
  while (c !== null) { path.unshift(c); c = parent[c]; }

  if (steps.length) {
    steps[steps.length - 1].finalPath = new Set(path);
    steps[steps.length - 1].operation = `Found treasure! Path length: ${path.length}`;
    steps[steps.length - 1].log = `🏆 DFS found treasure at ${fmtCell(treasure)}!`;
  }

  return steps;
};

// ─── A* ──────────────────────────────────────────────────────────────────────
const buildAStarSteps = (obstacles, treasure) => {
  const steps = [];
  const g = Array(CELL_COUNT).fill(Infinity);
  const f = Array(CELL_COUNT).fill(Infinity);
  const parent = Array(CELL_COUNT).fill(null);
  const visitedSet = new Set();
  let open = [START_INDEX];
  const openSet = new Set([START_INDEX]);
  g[START_INDEX] = 0;
  f[START_INDEX] = manhattan(START_INDEX, treasure);

  while (open.length) {
    open.sort((a, b) => f[a] - f[b]);
    const cur = open.shift();
    openSet.delete(cur);
    visitedSet.add(cur);

    const gn = g[cur];
    const hn = manhattan(cur, treasure);
    const fn = f[cur];

    const pqSnapshot = open.map((n) => ({
      node: n,
      g: g[n] === Infinity ? "∞" : g[n],
      h: manhattan(n, treasure),
      f: f[n] === Infinity ? "∞" : f[n],
    })).sort((a, b) => (typeof a.f === "number" ? a.f : 999) - (typeof b.f === "number" ? b.f : 999)).slice(0, 6);

    steps.push({
      current: cur,
      visited: new Set(visitedSet),
      queue: null,
      stack: null,
      pq: pqSnapshot,
      operation: `Selected lowest-cost node ${fmtCell(cur)} (f=${fn})`,
      log: `💡 A* selected ${fmtCell(cur)} — g=${gn}, h=${hn}, f=${fn}`,
      parent: {},
      gCost: gn, hCost: hn, fCost: fn,
    });

    if (cur === treasure) break;

    getNeighbors(cur).filter((n) => !obstacles.has(n)).forEach((n) => {
      const tg = g[cur] + 1;
      if (tg < g[n]) {
        parent[n] = cur;
        g[n] = tg;
        f[n] = tg + manhattan(n, treasure);
        if (!openSet.has(n)) { openSet.add(n); open.push(n); }

        const pqSnap2 = [...openSet].map((nd) => ({
          node: nd,
          g: g[nd] === Infinity ? "∞" : g[nd],
          h: manhattan(nd, treasure),
          f: f[nd] === Infinity ? "∞" : f[nd],
        })).sort((a, b) => (typeof a.f === "number" ? a.f : 999) - (typeof b.f === "number" ? b.f : 999)).slice(0, 6);

        steps.push({
          current: cur,
          visited: new Set(visitedSet),
          queue: null,
          stack: null,
          pq: pqSnap2,
          operation: `Updated ${fmtCell(n)} → f=${f[n]}`,
          log: `💡 A* updated ${fmtCell(n)}: g=${tg}, h=${manhattan(n, treasure)}, f=${f[n]}`,
          parent: {},
          gCost: tg,
          hCost: manhattan(n, treasure),
          fCost: f[n],
        });
      }
    });
  }

  const path = [];
  let c = treasure;
  while (c !== null) { path.unshift(c); c = parent[c]; }

  if (steps.length) {
    steps[steps.length - 1].finalPath = new Set(path);
    steps[steps.length - 1].operation = `Found treasure! Optimal path: ${path.length} nodes`;
    steps[steps.length - 1].log = `🏆 A* found optimal path to ${fmtCell(treasure)}! Length: ${path.length}`;
  }

  return steps;
};

// ─── Educational info ─────────────────────────────────────────────────────────
const EDU_INFO = {
  bfs: {
    title: "Breadth-First Search", icon: "🤖", color: "bfs",
    dataStructure: "Queue", principle: "FIFO", principleLabel: "First In, First Out",
    advantage: "Guarantees the shortest path in unweighted graphs.",
    timeComplexity: "O(V + E)", spaceComplexity: "O(V)",
    description: "BFS explores every neighbor at the current depth before moving deeper. It fans outward like a ripple, ensuring no shorter path is ever skipped.",
  },
  dfs: {
    title: "Depth-First Search", icon: "🧭", color: "dfs",
    dataStructure: "Stack", principle: "LIFO", principleLabel: "Last In, First Out",
    advantage: "Uses less memory than BFS in sparse graphs.",
    timeComplexity: "O(V + E)", spaceComplexity: "O(V)",
    description: "DFS commits to one direction, diving as deep as possible before backtracking. It can find a path quickly but does not guarantee the shortest one.",
  },
  astar: {
    title: "A* Search", icon: "💡", color: "astar",
    dataStructure: "Priority Queue", principle: "Lowest f(n) First", principleLabel: "f(n) = g(n) + h(n)",
    advantage: "Fastest optimal search using heuristic guidance.",
    timeComplexity: "O(E log V)", spaceComplexity: "O(V)",
    description: "A* combines the cost already paid (g) with a heuristic estimate of remaining cost (h). It always processes the most promising node first, making it both optimal and efficient.",
  },
};

const COMPARISON_ROWS = [
  { algo: "BFS 🤖", color: "bfs", structure: "Queue", operation: "Dequeue / Enqueue", memory: "High", shortest: "✅ Yes", best: "Unweighted shortest path" },
  { algo: "DFS 🧭", color: "dfs", structure: "Stack", operation: "Pop / Push", memory: "Low", shortest: "❌ No", best: "Memory-constrained search" },
  { algo: "A* 💡", color: "astar", structure: "Priority Queue", operation: "Extract-Min / Insert", memory: "Medium", shortest: "✅ Yes", best: "Weighted graphs & games" },
];

// ─── Main Component ───────────────────────────────────────────────────────────
export default function BackendExplorer() {
  const [maze] = useState(() => createMaze());
  const [selectedAlgo, setSelectedAlgo] = useState(null);
  const [steps, setSteps] = useState([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activityLog, setActivityLog] = useState([
    "Select an algorithm above to begin exploring its internals.",
  ]);
  const intervalRef = useRef(null);
  // ── FIX: ref points at the scrollable feed div, not a sentinel at page bottom
  const logFeedRef = useRef(null);

  // ── FIX: scroll the feed container itself, never the page
  useEffect(() => {
    if (logFeedRef.current) {
      logFeedRef.current.scrollTop = 0;
    }
  }, [activityLog]);

  // Auto-play interval
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setStepIndex((prev) => {
          if (prev >= steps.length - 1) {
            setIsPlaying(false);
            clearInterval(intervalRef.current);
            return prev;
          }
          return prev + 1;
        });
      }, 300);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isPlaying, steps.length]);

  // Log new step activity
  useEffect(() => {
    if (steps.length && stepIndex < steps.length) {
      const s = steps[stepIndex];
      setActivityLog((prev) => [s.log, ...prev.slice(0, 49)]);
    }
  }, [stepIndex, steps]);

  const selectAlgo = useCallback((algo) => {
    clearInterval(intervalRef.current);
    setIsPlaying(false);
    setSelectedAlgo(algo);
    const { obstacles, treasure } = maze;
    let built;
    if (algo === "bfs") built = buildBFSSteps(obstacles, treasure);
    else if (algo === "dfs") built = buildDFSSteps(obstacles, treasure);
    else built = buildAStarSteps(obstacles, treasure);
    setSteps(built);
    setStepIndex(0);
    setActivityLog([`${algo === "bfs" ? "🤖 BFS" : algo === "dfs" ? "🧭 DFS" : "💡 A*"} initialized — press ▶ Next Step or ⏯ Auto Play`]);
  }, [maze]);

  const handleNext = () => {
    if (stepIndex < steps.length - 1) setStepIndex((p) => p + 1);
  };
  const handlePlay = () => {
    if (stepIndex >= steps.length - 1) setStepIndex(0);
    setIsPlaying(true);
  };
  const handlePause = () => setIsPlaying(false);
  const handleReset = () => {
    clearInterval(intervalRef.current);
    setIsPlaying(false);
    setStepIndex(0);
    setActivityLog([`Reset — press ▶ Next Step or ⏯ Auto Play`]);
  };

  const currentStep = steps[stepIndex] || null;
  const visitedSet = currentStep?.visited || new Set();
  const finalPathSet = currentStep?.finalPath || new Set();
  const agentPos = currentStep?.current ?? START_INDEX;
  const edu = selectedAlgo ? EDU_INFO[selectedAlgo] : null;

  const queueItems = currentStep?.queue || [];
  const stackItems = currentStep?.stack || [];
  const pqItems = currentStep?.pq || [];

  return (
    <div className="be-page">
      <Navbar />

      <div className="be-body">
        {/* PAGE HEADER */}
        <div className="be-page-header">
          <div className="be-page-header-left">
            <span className="be-page-icon">🔬</span>
            <div>
              <h1 className="be-page-title">Backend Explorer</h1>
              <p className="be-page-subtitle">Visualize the internal data structures powering AI search algorithms.</p>
            </div>
          </div>
          {selectedAlgo && (
            <div className={`be-algo-pill ${selectedAlgo}`}>
              {selectedAlgo === "bfs" ? "🤖 BFS Active" : selectedAlgo === "dfs" ? "🧭 DFS Active" : "💡 A* Active"}
            </div>
          )}
        </div>

        {/* ALGORITHM SELECTOR */}
        <div className="be-selector-bar">
          <span className="be-selector-label">Select Algorithm</span>
          <div className="be-selector-btns">
            <button className={`be-sel-btn bfs ${selectedAlgo === "bfs" ? "active" : ""}`} onClick={() => selectAlgo("bfs")}>🤖 BFS</button>
            <button className={`be-sel-btn dfs ${selectedAlgo === "dfs" ? "active" : ""}`} onClick={() => selectAlgo("dfs")}>🧭 DFS</button>
            <button className={`be-sel-btn astar ${selectedAlgo === "astar" ? "active" : ""}`} onClick={() => selectAlgo("astar")}>💡 A*</button>
          </div>
          {selectedAlgo && (
            <div className="be-progress-wrap">
              <div className="be-progress-track">
                <div
                  className={`be-progress-fill ${selectedAlgo}`}
                  style={{ width: steps.length ? `${((stepIndex + 1) / steps.length) * 100}%` : "0%" }}
                />
              </div>
              <span className="be-progress-label">Step {stepIndex + 1} / {steps.length}</span>
            </div>
          )}
        </div>

        {/* MAIN TWO-COLUMN */}
        <div className="be-main">
          {/* LEFT — Maze */}
          <div className="be-left">
            <div className="be-card be-maze-card">
              <div className="be-card-header">
                <p className="be-eyebrow">Maze Visualization</p>
                <h3 className="be-card-title">
                  {selectedAlgo
                    ? selectedAlgo === "bfs" ? "🤖 BFS Exploration" : selectedAlgo === "dfs" ? "🧭 DFS Exploration" : "💡 A* Exploration"
                    : "🗺️ Treasure Hunt Maze"}
                </h3>
              </div>

              <div className="be-maze-wrapper">
                <div className="maze-shell">
                  {Array.from({ length: CELL_COUNT }, (_, idx) => {
                    const isTreasure = idx === maze.treasure;
                    const isPortal = idx === maze.portal;
                    const isObstacle = maze.obstacles.has(idx);
                    const isStart = idx === START_INDEX;
                    const isAgent = idx === agentPos && selectedAlgo && !finalPathSet.size;
                    const isVisited = visitedSet.has(idx);
                    const isPath = finalPathSet.has(idx);
                    const isCurrent = idx === agentPos && selectedAlgo;

                    const cls = [
                      "cell",
                      isStart && "start",
                      isTreasure && "treasure",
                      isPortal && "portal",
                      isObstacle && "obstacle",
                      !isObstacle && isVisited && !isPath && `visited-${selectedAlgo}`,
                      isPath && "final-path",
                      isCurrent && !isObstacle && !isTreasure && !isPath && "cell-current",
                    ].filter(Boolean).join(" ");

                    const icon = isTreasure ? "💎" : isPortal ? "🚪" : isObstacle ? "🪨" : "";

                    return (
                      <div key={idx} className={cls}>
                        {isAgent && !isTreasure && !isObstacle && (
                          <div className={`agent-badge ${selectedAlgo}`}>
                            {selectedAlgo === "bfs" ? "🤖" : selectedAlgo === "dfs" ? "🧭" : "💡"}
                          </div>
                        )}
                        <div className="cell-label">{icon}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="be-legend">
                {selectedAlgo === "bfs" && <span className="leg bfs">🔵 BFS Visited</span>}
                {selectedAlgo === "dfs" && <span className="leg dfs">🟣 DFS Visited</span>}
                {selectedAlgo === "astar" && <span className="leg astar">🟢 A* Visited</span>}
                <span className="leg gold">✨ Path</span>
                <span className="leg">💎 Treasure</span>
                <span className="leg">🚪 Portal</span>
                <span className="leg">🪨 Wall</span>
              </div>

              <div className="be-controls">
                <button className="be-ctrl-btn" onClick={handleNext} disabled={!selectedAlgo || stepIndex >= steps.length - 1}>▶ Next Step</button>
                <button className={`be-ctrl-btn play`} onClick={handlePlay} disabled={!selectedAlgo || isPlaying}>⏯ Auto Play</button>
                <button className="be-ctrl-btn pause" onClick={handlePause} disabled={!isPlaying}>⏸ Pause</button>
                <button className="be-ctrl-btn reset" onClick={handleReset} disabled={!selectedAlgo}>🔄 Reset</button>
              </div>

              <div className={`be-operation-panel ${selectedAlgo || ""}`}>
                <span className="be-op-label">Current Operation</span>
                <p className="be-op-text">
                  {currentStep ? currentStep.operation : "— Select an algorithm and press Next Step —"}
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT — Data Structure Visualizer */}
          <div className="be-right">
            <div className="be-card be-ds-card">
              <div className="be-card-header">
                <p className="be-eyebrow">Internal Data Structure</p>
                <h3 className="be-card-title">
                  {!selectedAlgo && "Select an algorithm →"}
                  {selectedAlgo === "bfs" && "🤖 Queue (FIFO)"}
                  {selectedAlgo === "dfs" && "🧭 Stack (LIFO)"}
                  {selectedAlgo === "astar" && "💡 Priority Queue"}
                </h3>
              </div>

              {selectedAlgo === "bfs" && (
                <div className="be-ds-body">
                  <div className="be-ds-label-row">
                    <span className="be-ds-end-label front">◀ FRONT (Dequeue)</span>
                    <span className="be-ds-end-label rear">REAR (Enqueue) ▶</span>
                  </div>
                  <div className="be-queue-track">
                    {queueItems.length === 0 && <div className="be-ds-empty">Queue is empty</div>}
                    {queueItems.slice(0, 10).map((node, i) => (
                      <div key={`${node}-${i}`} className={`be-queue-node bfs ${i === 0 ? "front" : ""}`}>
                        <span className="be-node-coord">{fmtCell(node)}</span>
                        {i === 0 && <span className="be-node-tag">NEXT</span>}
                      </div>
                    ))}
                    {queueItems.length > 10 && <div className="be-ds-more">+{queueItems.length - 10} more</div>}
                  </div>
                  <div className="be-ds-meta">
                    <div className="be-ds-meta-item">
                      <span className="be-ds-meta-label">Queue Size</span>
                      <strong className="be-ds-meta-val bfs">{queueItems.length}</strong>
                    </div>
                    <div className="be-ds-meta-item">
                      <span className="be-ds-meta-label">Nodes Visited</span>
                      <strong className="be-ds-meta-val bfs">{visitedSet.size}</strong>
                    </div>
                    <div className="be-ds-meta-item">
                      <span className="be-ds-meta-label">Current Node</span>
                      <strong className="be-ds-meta-val bfs">{currentStep ? fmtCell(currentStep.current) : "—"}</strong>
                    </div>
                  </div>
                </div>
              )}

              {selectedAlgo === "dfs" && (
                <div className="be-ds-body">
                  <div className="be-ds-label-row">
                    <span className="be-ds-end-label front">▲ TOP (Pop / Push)</span>
                    <span className="be-ds-end-label rear">Nodes Visited: {visitedSet.size}</span>
                  </div>
                  <div className="be-stack-track">
                    {stackItems.length === 0 && <div className="be-ds-empty">Stack is empty</div>}
                    {[...stackItems].reverse().slice(0, 8).map((node, i) => (
                      <div key={`${node}-${i}`} className={`be-stack-node dfs ${i === 0 ? "top" : ""}`}>
                        <span className="be-node-coord">{fmtCell(node)}</span>
                        {i === 0 && <span className="be-node-tag">TOP</span>}
                      </div>
                    ))}
                    {stackItems.length > 8 && <div className="be-ds-more">+{stackItems.length - 8} more below</div>}
                  </div>
                  <div className="be-ds-meta">
                    <div className="be-ds-meta-item">
                      <span className="be-ds-meta-label">Stack Size</span>
                      <strong className="be-ds-meta-val dfs">{stackItems.length}</strong>
                    </div>
                    <div className="be-ds-meta-item">
                      <span className="be-ds-meta-label">Nodes Visited</span>
                      <strong className="be-ds-meta-val dfs">{visitedSet.size}</strong>
                    </div>
                    <div className="be-ds-meta-item">
                      <span className="be-ds-meta-label">Current Node</span>
                      <strong className="be-ds-meta-val dfs">{currentStep ? fmtCell(currentStep.current) : "—"}</strong>
                    </div>
                  </div>
                </div>
              )}

              {selectedAlgo === "astar" && (
                <div className="be-ds-body">
                  <div className="be-astar-formula">
                    <div className="be-formula-box">
                      <span className="be-formula-fn">f(n)</span>
                      <span className="be-formula-eq">=</span>
                      <span className="be-formula-gn">g(n)</span>
                      <span className="be-formula-plus">+</span>
                      <span className="be-formula-hn">h(n)</span>
                    </div>
                    <div className="be-formula-legend">
                      <span className="be-fl-item gn">g(n) = cost so far</span>
                      <span className="be-fl-item hn">h(n) = heuristic estimate</span>
                      <span className="be-fl-item fn">f(n) = total priority</span>
                    </div>
                  </div>
                  {currentStep?.gCost !== null && (
                    <div className="be-astar-costs">
                      <div className="be-cost-box gn"><span className="be-cost-label">g(n)</span><strong className="be-cost-val">{currentStep.gCost}</strong></div>
                      <span className="be-cost-plus">+</span>
                      <div className="be-cost-box hn"><span className="be-cost-label">h(n)</span><strong className="be-cost-val">{currentStep.hCost}</strong></div>
                      <span className="be-cost-plus">=</span>
                      <div className="be-cost-box fn"><span className="be-cost-label">f(n)</span><strong className="be-cost-val">{currentStep.fCost}</strong></div>
                    </div>
                  )}
                  <div className="be-pq-header-row">
                    <span>Node</span><span>g(n)</span><span>h(n)</span><span>f(n)</span>
                  </div>
                  <div className="be-pq-list">
                    {pqItems.length === 0 && <div className="be-ds-empty">Priority queue is empty</div>}
                    {pqItems.map((item, i) => (
                      <div key={`${item.node}-${i}`} className={`be-pq-row astar ${i === 0 ? "best" : ""}`}>
                        <span className="be-pq-node">{fmtCell(item.node)}</span>
                        <span className="be-pq-g">{item.g}</span>
                        <span className="be-pq-h">{item.h}</span>
                        <span className="be-pq-f">{item.f}</span>
                        {i === 0 && <span className="be-pq-best-tag">BEST</span>}
                      </div>
                    ))}
                  </div>
                  <div className="be-ds-meta">
                    <div className="be-ds-meta-item"><span className="be-ds-meta-label">Open Set</span><strong className="be-ds-meta-val astar">{pqItems.length}</strong></div>
                    <div className="be-ds-meta-item"><span className="be-ds-meta-label">Closed Set</span><strong className="be-ds-meta-val astar">{visitedSet.size}</strong></div>
                    <div className="be-ds-meta-item"><span className="be-ds-meta-label">Current f(n)</span><strong className="be-ds-meta-val astar">{currentStep?.fCost ?? "—"}</strong></div>
                  </div>
                </div>
              )}

              {!selectedAlgo && (
                <div className="be-ds-placeholder">
                  <div className="be-placeholder-icons"><span>🤖</span><span>🧭</span><span>💡</span></div>
                  <p>Choose BFS, DFS, or A* above to see its internal data structure animate in real time.</p>
                </div>
              )}
            </div>

            {/* Activity Feed — scrolls internally via ref, never jumps the page */}
            <div className="be-card be-log-card">
              <div className="be-card-header">
                <p className="be-eyebrow">Activity Feed</p>
                <h3 className="be-card-title">📋 Execution Log</h3>
              </div>
              {/* ── FIX: ref on the feed container, no sentinel div at bottom ── */}
              <div className="be-log-feed" ref={logFeedRef}>
                {activityLog.map((entry, i) => (
                  <div key={i} className={`be-log-entry ${i === 0 ? "newest" : ""}`}>
                    <span className="be-log-dot" />
                    <span className="be-log-text">{entry}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* EDUCATIONAL PANEL */}
        {edu && (
          <div className={`be-edu-panel ${edu.color}`}>
            <div className="be-edu-header">
              <span className="be-edu-icon">{edu.icon}</span>
              <div>
                <p className="be-eyebrow">How It Works</p>
                <h3 className="be-edu-title">{edu.title}</h3>
              </div>
            </div>
            <div className="be-edu-grid">
              <div className="be-edu-card"><span className="be-edu-card-label">Data Structure</span><strong className="be-edu-card-val">{edu.dataStructure}</strong></div>
              <div className="be-edu-card"><span className="be-edu-card-label">Principle</span><strong className="be-edu-card-val">{edu.principle}</strong></div>
              <div className="be-edu-card"><span className="be-edu-card-label">Meaning</span><strong className="be-edu-card-val">{edu.principleLabel}</strong></div>
              <div className="be-edu-card"><span className="be-edu-card-label">Advantage</span><strong className="be-edu-card-val">{edu.advantage}</strong></div>
              <div className="be-edu-card"><span className="be-edu-card-label">Time Complexity</span><strong className="be-edu-card-val mono">{edu.timeComplexity}</strong></div>
              <div className="be-edu-card"><span className="be-edu-card-label">Space Complexity</span><strong className="be-edu-card-val mono">{edu.spaceComplexity}</strong></div>
            </div>
            <p className="be-edu-desc">{edu.description}</p>
          </div>
        )}

        {/* COMPARISON TABLE */}
        <div className="be-card be-compare-card">
          <div className="be-card-header">
            <p className="be-eyebrow">Side-by-Side Comparison</p>
            <h3 className="be-card-title">BFS vs DFS vs A*</h3>
          </div>
          <div className="be-compare-table-wrap">
            <table className="be-compare-table">
              <thead>
                <tr>
                  <th>Algorithm</th><th>Data Structure</th><th>Operation</th>
                  <th>Memory Usage</th><th>Shortest Path</th><th>Best Use Case</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row) => (
                  <tr key={row.algo} className={selectedAlgo === row.color ? "be-row-active" : ""}>
                    <td className={`be-cmp-algo ${row.color}`}>{row.algo}</td>
                    <td>{row.structure}</td>
                    <td><code className="be-code">{row.operation}</code></td>
                    <td>{row.memory}</td>
                    <td className={row.shortest.startsWith("✅") ? "be-yes" : "be-no"}>{row.shortest}</td>
                    <td>{row.best}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}