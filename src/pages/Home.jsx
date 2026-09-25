import Hero from "../components/Hero/Hero";
import FeatureCards from "../components/FeatureCards/FeatureCards";
import Statistics from "../components/Statistics/Statistics";
import About from "../components/About/About";
import Footer from "../components/Footer/Footer";
import Navbar from "../components/Navbar/Navbar";
function Home() {
  return (
    <>
    <Navbar />
      <Hero />
      <FeatureCards />
      <Statistics />
      <About />
      <Footer />
    </>
  );
}

export default Home;