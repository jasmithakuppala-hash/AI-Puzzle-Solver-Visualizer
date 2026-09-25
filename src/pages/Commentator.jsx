import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";

function Commentator() {
  return (
    <>
      <Navbar />
      <main className="page-content">
        <section className="page-hero">
          <h1>Commentator Mode</h1>
          <p>
            AI narrates every move and explains the search process live.
          </p>
        </section>

        <section className="page-description">
          <p>
            Follow the search algorithm step-by-step with voice-style
            commentary and visual markers.
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}

export default Commentator;
