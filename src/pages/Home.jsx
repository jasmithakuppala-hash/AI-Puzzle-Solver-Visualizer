import Hero from "../components/Hero/Hero";
import FeatureCards from "../components/FeatureCards/FeatureCards";
import Statistics from "../components/Statistics/Statistics";
import About from "../components/About/About";

function Home() {
  return (
    <>
      <Hero />
      <FeatureCards />
      <Statistics />
      <About />
    </>
  );
}

export default Home;