import "./Statistics.css";

const stats = [
  {
    title: "BFS Speed",
    value: "0.014 ms",
  },
  {
    title: "DFS Speed",
    value: "0.026 ms",
  },
  {
    title: "A* Speed",
    value: "0.009 ms",
  },
  {
    title: "Visited Nodes",
    value: "124",
  },
];

function Statistics() {
  return (
    <section className="statistics">

      <div className="statistics-header">

        <span>LIVE PERFORMANCE</span>

        <h2>Algorithm Statistics</h2>

        <p>
          Compare the efficiency of different AI search algorithms
          through interactive Treasure Hunt simulations.
        </p>

      </div>

      <div className="statistics-grid">

        {stats.map((item, index) => (

          <div className="statistics-card" key={index}>

            <h4>{item.title}</h4>

            <h1>{item.value}</h1>

          </div>

        ))}

      </div>

    </section>
  );
}

export default Statistics;