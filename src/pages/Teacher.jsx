import { useEffect, useRef, useState } from "react";
import Navbar from "../components/Navbar/Navbar";
import "./Teacher.css";

// ─── Maze config ────────────────────────────────────────────────────────────
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
  return [
    [r, c + 1],[r + 1, c],[r, c - 1],[r - 1, c],
  ]
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

// ─── Algorithm runners ───────────────────────────────────────────────────────
const runBFS = (obstacles, treasure) => {
  const visited = Array(CELL_COUNT).fill(false);
  const queue = [START_INDEX];
  visited[START_INDEX] = true;
  const order = [];
  const parent = Array(CELL_COUNT).fill(null);
  while (queue.length) {
    const cur = queue.shift();
    order.push(cur);
    if (cur === treasure) break;
    getNeighbors(cur).forEach((n) => {
      if (!visited[n] && !obstacles.has(n)) {
        visited[n] = true;
        parent[n] = cur;
        queue.push(n);
      }
    });
  }
  const path = [];
  let c = treasure;
  while (c !== null) { path.unshift(c); c = parent[c]; }
  return { order, path };
};

const runDFS = (obstacles, treasure) => {
  const visited = Array(CELL_COUNT).fill(false);
  const stack = [START_INDEX];
  const order = [];
  const parent = Array(CELL_COUNT).fill(null);
  while (stack.length) {
    const cur = stack.pop();
    if (visited[cur]) continue;
    visited[cur] = true;
    order.push(cur);
    if (cur === treasure) break;
    getNeighbors(cur)
      .filter((n) => !visited[n] && !obstacles.has(n))
      .sort((a, b) => manhattan(b, treasure) - manhattan(a, treasure))
      .forEach((n) => { parent[n] = cur; stack.push(n); });
  }
  const path = [];
  let c = treasure;
  while (c !== null) { path.unshift(c); c = parent[c]; }
  return { order, path };
};

const runAStar = (obstacles, treasure) => {
  const g = Array(CELL_COUNT).fill(Infinity);
  const f = Array(CELL_COUNT).fill(Infinity);
  const parent = Array(CELL_COUNT).fill(null);
  const open = [START_INDEX];
  const openSet = new Set([START_INDEX]);
  g[START_INDEX] = 0;
  f[START_INDEX] = manhattan(START_INDEX, treasure);
  const order = [];
  while (open.length) {
    open.sort((a, b) => f[a] - f[b]);
    const cur = open.shift();
    openSet.delete(cur);
    order.push(cur);
    if (cur === treasure) break;
    getNeighbors(cur).filter((n) => !obstacles.has(n)).forEach((n) => {
      const tg = g[cur] + 1;
      if (tg < g[n]) {
        parent[n] = cur;
        g[n] = tg;
        f[n] = tg + manhattan(n, treasure);
        if (!openSet.has(n)) { openSet.add(n); open.push(n); }
      }
    });
  }
  const path = [];
  let c = treasure;
  while (c !== null) { path.unshift(c); c = parent[c]; }
  return { order, path };
};

// ─── Lesson content ──────────────────────────────────────────────────────────
const LESSONS = {
  bfs: [
    { type: "ai", text: "Great choice! Let's learn Breadth-First Search (BFS). 🤖" },
    { type: "ai", text: "BFS explores the maze level by level — all cells at distance 1 first, then distance 2, and so on." },
    { type: "ai", text: "It uses a Queue data structure. Think of it like a line at a coffee shop — first in, first out." },
    { type: "ai", text: "Because it explores evenly outward in all directions, BFS always finds the shortest path in an unweighted maze. 🏆" },
    { type: "ai", text: "Time Complexity: O(V + E) — every vertex and edge is visited once.", tag: "complexity" },
    { type: "ai", text: "Watch the blue agent explore the maze. Notice how it fans out in all directions before going deeper! 👀" },
  ],
  dfs: [
    { type: "ai", text: "Excellent! Let's explore Depth-First Search (DFS). 🧭" },
    { type: "ai", text: "DFS commits to one path and dives as deep as possible before turning back." },
    { type: "ai", text: "It uses a Stack — last in, first out. This is what gives DFS its deep, tunnel-like behavior." },
    { type: "ai", text: "When DFS hits a dead end, it backtracks to the last junction and tries a different route. 🔄" },
    { type: "ai", text: "DFS doesn't guarantee the shortest path — it finds A path, not necessarily the BEST path.", tag: "warning" },
    { type: "ai", text: "Watch the purple agent dive deep into one corridor. Notice the backtracking! 👀" },
  ],
  astar: [
    { type: "ai", text: "Smart choice! A* is the most intelligent search algorithm. 💡" },
    { type: "ai", text: "A* uses a heuristic — a smart estimate — to guide its search toward the goal." },
    { type: "ai", text: "It evaluates each cell using: f(n) = g(n) + h(n)", tag: "formula" },
    { type: "ai", text: "Where g(n) is the distance already travelled from start, and h(n) is the estimated distance remaining to the treasure." },
    { type: "ai", text: "A* uses a Priority Queue — it always processes the most promising cell first. 🎯" },
    { type: "ai", text: "This makes A* faster than BFS in most cases while still guaranteeing the shortest path! Watch the green agent work smart, not hard. 👀" },
  ],
};

const ALGO_STATS = {
  bfs:   { timeComplexity: "O(V + E)", spaceComplexity: "O(V)", dataStructure: "Queue (FIFO)",    description: "Shortest path guaranteed" },
  dfs:   { timeComplexity: "O(V + E)", spaceComplexity: "O(V)", dataStructure: "Stack (LIFO)",    description: "Not shortest path" },
  astar: { timeComplexity: "O(E log V)", spaceComplexity: "O(V)", dataStructure: "Priority Queue", description: "Optimal & efficient" },
};

const COMPARISON = [
  { algo: "BFS 🤖", style: "Level by level",    structure: "Queue",          speed: "Moderate", memory: "High",   best: "Shortest path (unweighted)", color: "bfs" },
  { algo: "DFS 🧭", style: "Deep first",         structure: "Stack",          speed: "Fast",     memory: "Low",    best: "Memory-constrained search",  color: "dfs" },
  { algo: "A* 💡",  style: "Heuristic-guided",   structure: "Priority Queue", speed: "Fastest",  memory: "Medium", best: "Weighted graphs & games",    color: "astar" },
];

// ─── Footer Component ─────────────────────────────────────────────────────────
function TeacherFooter() {
  return (
    <footer className="teacher-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <h3>AI Puzzle Solver</h3>
          <p>An interactive platform for learning AI search algorithms through visual exploration and step-by-step guidance.</p>
        </div>
        <div className="footer-col">
          <h4>Learn</h4>
          <ul>
            <li><a href="#">BFS Tutorial</a></li>
            <li><a href="#">DFS Tutorial</a></li>
            <li><a href="#">A* Search</a></li>
            <li><a href="#">Algorithm Comparison</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Explore</h4>
          <ul>
            <li><a href="#">Backend Explorer</a></li>
            <li><a href="#">AI Mentor</a></li>
            <li><a href="#">Statistics</a></li>
            <li><a href="#">Features</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>About</h4>
          <ul>
            <li><a href="#">How It Works</a></li>
            <li><a href="#">Contact</a></li>
            <li><a href="#">Documentation</a></li>
            <li><a href="#">Feedback</a></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2025 AI Puzzle Solver. Built for learning, exploration & discovery.</p>
        <div className="footer-badges">
          <span className="footer-badge bfs">BFS</span>
          <span className="footer-badge dfs">DFS</span>
          <span className="footer-badge astar">A*</span>
        </div>
      </div>
    </footer>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function Teacher() {
  const [maze] = useState(() => createMaze());
  const [selectedAlgo, setSelectedAlgo] = useState(null);
  const [messages, setMessages] = useState([
    { type: "ai", text: "Hello Student 👋" },
    { type: "ai", text: "Today we will learn how AI Search Algorithms explore a Treasure Hunt Maze." },
    { type: "ai", text: "Choose an algorithm below to begin.", showButtons: true },
  ]);
  const [algoData, setAlgoData] = useState(null);
  const [step, setStep] = useState(0);
  const [animating, setAnimating] = useState(false);
  const chatEndRef = useRef(null);
  const chatWindowRef = useRef(null);
  const intervalRef = useRef(null);

  // ── FIX: scroll only inside chat window, not the whole page ──
  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (!algoData || animating) return;
    setAnimating(true);
    setStep(0);
    let s = 0;
    intervalRef.current = setInterval(() => {
      s += 1;
      setStep(s);
      if (s >= algoData.order.length - 1) {
        clearInterval(intervalRef.current);
        setAnimating(false);
      }
    }, 120);
    return () => clearInterval(intervalRef.current);
  }, [algoData]);

  const selectAlgo = (algo) => {
    if (selectedAlgo === algo) return;
    clearInterval(intervalRef.current);
    setSelectedAlgo(algo);

    const { treasure, obstacles } = maze;
    let data;
    if (algo === "bfs") data = runBFS(obstacles, treasure);
    else if (algo === "dfs") data = runDFS(obstacles, treasure);
    else data = runAStar(obstacles, treasure);
    setAlgoData(data);
    setStep(0);
    setAnimating(false);

    const label = algo === "astar" ? "A*" : algo.toUpperCase();
    const lesson = LESSONS[algo];

    setMessages((prev) => [
      ...prev.filter((m) => !m.showButtons),
      { type: "user", text: `I want to learn ${label}` },
    ]);

    const lessonFlow = [
      ...lesson,
      { type: "ai", text: `Ready! Watch the ${label} visualization on the right →`, showButtons: true },
    ];

    lessonFlow.forEach((msg, index) => {
      setTimeout(() => {
        setMessages((prev) => [...prev, msg]);
      }, 200 + index * 1000);
    });
  };

  const visited = algoData ? new Set(algoData.order.slice(0, step + 1)) : new Set();
  const pathSet = algoData && step >= algoData.order.length - 1
    ? new Set(algoData.path)
    : new Set();

  const agentPos = algoData ? algoData.order[Math.min(step, algoData.order.length - 1)] : START_INDEX;
  const stats = selectedAlgo ? ALGO_STATS[selectedAlgo] : null;

  return (
    <div className="teacher-page">
      <Navbar />

      <main className="teacher-main">
        {/* ── LEFT: Chat ─────────────────────────────────────── */}
        <section className="teacher-chat-col">
          <div className="mentor-header">
            <div className="mentor-avatar">🎓</div>
            <div>
              <h2 className="mentor-name">AI Mentor</h2>
              <p className="mentor-sub">Learn Search Algorithms Through Interactive Guidance</p>
            </div>
            <div className="mentor-status">
              <span className="status-dot" />
              Live
            </div>
          </div>

          {/* ── FIX: attach ref to the scrollable window div ── */}
          <div className="chat-window" ref={chatWindowRef}>
            {messages.map((msg, i) => (
              <div key={i} className={`chat-msg ${msg.type}`}>
                {msg.type === "ai" && <div className="chat-avatar-sm">🎓</div>}
                <div className={`chat-bubble ${msg.tag || ""}`}>
                  {msg.text}
                  {msg.showButtons && (
                    <div className="algo-btns">
                      <button className={`algo-btn bfs ${selectedAlgo === "bfs" ? "active" : ""}`} onClick={() => selectAlgo("bfs")}>🤖 BFS</button>
                      <button className={`algo-btn dfs ${selectedAlgo === "dfs" ? "active" : ""}`} onClick={() => selectAlgo("dfs")}>🧭 DFS</button>
                      <button className={`algo-btn astar ${selectedAlgo === "astar" ? "active" : ""}`} onClick={() => selectAlgo("astar")}>💡 A*</button>
                    </div>
                  )}
                </div>
                {msg.type === "user" && <div className="chat-avatar-sm user">👤</div>}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <div className="comparison-card">
            <p className="section-eyebrow">Algorithm Comparison</p>
            <h3 className="comparison-title">BFS vs DFS vs A*</h3>
            <div className="comparison-table-wrap">
              <table className="comparison-table">
                <thead>
                  <tr>
                    <th>Algorithm</th>
                    <th>Search Style</th>
                    <th>Structure</th>
                    <th>Speed</th>
                    <th>Memory</th>
                    <th>Best Use Case</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON.map((row) => (
                    <tr
                      key={row.algo}
                      className={`table-row ${row.color} ${
                        selectedAlgo === row.color || (selectedAlgo === "astar" && row.color === "astar")
                          ? "highlighted"
                          : ""
                      }`}
                    >
                      <td className={`algo-label ${row.color}`}>{row.algo}</td>
                      <td>{row.style}</td>
                      <td>{row.structure}</td>
                      <td>{row.speed}</td>
                      <td>{row.memory}</td>
                      <td>{row.best}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ── RIGHT: Visualization ────────────────────────────── */}
        <section className="teacher-viz-col">
          <div className="viz-header">
            <div>
              <p className="section-eyebrow">Visualization Panel</p>
              <h2 className="viz-title">
                {selectedAlgo
                  ? selectedAlgo === "bfs"
                    ? "🤖 BFS — Breadth-First Search"
                    : selectedAlgo === "dfs"
                    ? "🧭 DFS — Depth-First Search"
                    : "💡 A* — Heuristic Search"
                  : "🗺️ Treasure Hunt Maze"}
              </h2>
            </div>
            {selectedAlgo && (
              <div className={`algo-badge ${selectedAlgo}`}>
                {selectedAlgo === "bfs" ? "Queue" : selectedAlgo === "dfs" ? "Stack" : "Priority Queue"}
              </div>
            )}
          </div>

          <div className="maze-wrapper">
            <div className="maze-shell">
              {Array.from({ length: CELL_COUNT }, (_, idx) => {
                const isTreasure = idx === maze.treasure;
                const isPortal = idx === maze.portal;
                const isObstacle = maze.obstacles.has(idx);
                const isStart = idx === START_INDEX;
                const isAgent = idx === agentPos && selectedAlgo;
                const isVisited = visited.has(idx);
                const isPath = pathSet.has(idx);

                const cls = [
                  "cell",
                  isStart && "start",
                  isTreasure && "treasure",
                  isPortal && "portal",
                  isObstacle && "obstacle",
                  !isObstacle && isVisited && `visited-${selectedAlgo}`,
                  isPath && "final-path",
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

          <div className="viz-legend">
            {selectedAlgo === "bfs"   && <span className="leg bfs">🔵 BFS Visited</span>}
            {selectedAlgo === "dfs"   && <span className="leg dfs">🟣 DFS Visited</span>}
            {selectedAlgo === "astar" && <span className="leg astar">🟢 A* Visited</span>}
            <span className="leg gold">✨ Final Path</span>
            <span className="leg">💎 Treasure</span>
            <span className="leg">🚪 Portal</span>
            <span className="leg">🪨 Obstacle</span>
          </div>

          <div className="stats-panel">
            <p className="section-eyebrow">Educational Stats</p>
            <div className="stats-grid">
              <div className="stat-card">
                <span className="stat-label">Time Complexity</span>
                <strong className="stat-value">{stats?.timeComplexity ?? "—"}</strong>
              </div>
              <div className="stat-card">
                <span className="stat-label">Space Complexity</span>
                <strong className="stat-value">{stats?.spaceComplexity ?? "—"}</strong>
              </div>
              <div className="stat-card">
                <span className="stat-label">Data Structure</span>
                <strong className="stat-value">{stats?.dataStructure ?? "—"}</strong>
              </div>
              <div className="stat-card">
                <span className="stat-label">Path Length</span>
                <strong className="stat-value">
                  {algoData && step >= algoData.order.length - 1 ? algoData.path.length : "—"}
                </strong>
              </div>
              <div className="stat-card">
                <span className="stat-label">Visited Nodes</span>
                <strong className="stat-value">
                  {algoData ? Math.min(step + 1, algoData.order.length) : "—"}
                </strong>
              </div>
              <div className="stat-card">
                <span className="stat-label">Verdict</span>
                <strong className="stat-value verdict">{stats?.description ?? "—"}</strong>
              </div>
            </div>
          </div>
        </section>
      </main>

      <TeacherFooter />
    </div>
  );
}