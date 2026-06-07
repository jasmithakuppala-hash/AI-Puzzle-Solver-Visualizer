import "./FeatureCards.css";

const features = [
  {
    icon: "🏁",
    title: "Multi-Agent Race",
    description:
      "Compare BFS, DFS and A* solving the same Treasure Hunt maze in real time."
  },
  {
    icon: "👩‍🏫",
    title: "Teacher Mode",
    description:
      "Learn every algorithm decision through interactive visual explanations."
  },
  {
    icon: "🎙️",
    title: "Commentator Mode",
    description:
      "AI narrates every move and explains the search process live."
  },
  {
    icon: "🔬",
    title: "Backend Explorer",
    description:
      "Visualize Queue, Stack, Priority Queue and Visited Set."
  }
];

function FeatureCards() {
  return (
    <section className="features">

      <div className="section-title">

        <span>EXPERIENCES</span>

        <h2>Choose Your Experience</h2>

        <p>
          Explore AI search algorithms through interactive Treasure Hunt
          visualizations.
        </p>

      </div>

      <div className="cards-grid">

        {features.map((feature, index) => (

          <div className="feature-card" key={index}>

            <div className="feature-icon">

              {feature.icon}

            </div>

            <h3>{feature.title}</h3>

            <p>{feature.description}</p>

            <button>

              Explore →

            </button>

          </div>

        ))}

      </div>

    </section>
  );
}

export default FeatureCards;