# 🧩 AI Puzzle Solver Visualizer

An interactive, high-performance web application designed to visualize and compare fundamental Artificial Intelligence search algorithms (BFS, DFS, and A*) through an immersive **Treasure Hunt Maze** simulation.

![AI Puzzle Solver Visualizer](src/assets/hero.png)

---

## 🌟 Features & Modes

### 1. 🏁 Multi-Agent Race (`/multi-agent`)
* **Real-Time Algorithm Comparison**: Watch **BFS**, **DFS**, and **A\*** race simultaneously on the exact same procedurally generated maze.
* **Live Speed & Control**: Adjust simulation speed dynamically ($1x$, $2x$, $5x$, $10x$), pause/play, step through iterations, or generate new mazes on the fly.
* **Performance Analytics**: View live metrics including steps taken, total nodes visited, path length, and execution time with interactive leaderboards.

### 2. 👩‍🏫 Teacher Mode (`/teacher`)
* **Interactive Step-by-Step Learning**: Visual breakdown of algorithm decisions at every tick.
* **Frontier & Path Tracking**: See how nodes are added to the open set (frontier) and closed set (visited).
* **Educational Explanations**: Dynamic text explaining *why* the algorithm picked a specific node and how heuristics guide the search direction.

### 3. 🔬 Backend Explorer (`/backend`)
* **Under-the-Hood Data Structure Visualization**: Real-time inspection of low-level data structures backing each algorithm:
  * **BFS**: FIFO Queue visualization.
  * **DFS**: LIFO Stack depth traversal.
  * **A\***: Priority Queue sorted by evaluation function $f(n) = g(n) + h(n)$ (where $h(n)$ is Manhattan distance).
  * **Visited Set**: State tracking set ensuring no redundant path exploration.
* **State Mutation Logs**: Timeline slider to move forward and backward through exact data structure state transitions.

---

## 🧠 Algorithms Visualized

| Algorithm | Data Structure | Heuristic | Optimality | Time Complexity | Space Complexity |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **BFS** (Breadth-First Search) | Queue (FIFO) | None | Shortest path guaranteed (unweighted) | $\mathcal{O}(V + E)$ | $\mathcal{O}(V)$ |
| **DFS** (Depth-First Search) | Stack (LIFO) | None | Not guaranteed | $\mathcal{O}(V + E)$ | $\mathcal{O}(V)$ |
| **A\* Search** | Priority Queue | Manhattan Distance $h(n) = \|x_1 - x_2\| + \|y_1 - y_2\|$ | Optimal with admissible heuristic | $\mathcal{O}(E)$ | $\mathcal{O}(V)$ |

---

## 🛠️ Tech Stack

* **Frontend Library**: [React 19](https://react.dev/)
* **Build Tool & Dev Server**: [Vite 8](https://vitejs.dev/)
* **Routing**: [React Router v7](https://reactrouter.com/)
* **Styling**: Vanilla CSS (Custom Design System with Glassmorphism, Micro-animations, dark mode aesthetic)

---

## 📁 Project Structure

```text
AI-Puzzle-Solver-Visualizer/
├── public/                # Static assets & icons
├── src/
│   ├── assets/            # Project images and SVG graphics
│   ├── components/        # Reusable UI components
│   │   ├── About/         # About section component
│   │   ├── FeatureCards/  # Mode exploration cards
│   │   ├── Footer/        # Application footer
│   │   ├── Hero/          # Hero section with live stats mockup
│   │   ├── Navbar/        # Navigation bar with smooth scroll
│   │   └── Statistics/    # Statistics section
│   ├── pages/             # Main application pages
│   │   ├── Home.jsx           # Landing page
│   │   ├── MultiAgent.jsx     # Multi-Agent Race visualization
│   │   ├── Teacher.jsx        # Interactive Teacher mode
│   │   └── BackendExplorer.jsx# Low-level data structures visualizer
│   ├── App.jsx            # Router and app layout
│   └── main.jsx           # Entry point
├── index.html             # HTML entry point
├── package.json           # Scripts and dependencies
└── vite.config.js         # Vite configuration
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) (v18+ recommended) and `npm` installed.

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/jasmithakuppala-hash/AI-Puzzle-Solver-Visualizer.git
   cd AI-Puzzle-Solver-Visualizer
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser to view the application.

4. **Build for production**:
   ```bash
   npm run build
   ```

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
