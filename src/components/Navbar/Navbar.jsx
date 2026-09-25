import { useEffect, useState } from "react";
import "./Navbar.css";

const sections = [
  { id: "hero", label: "Home" },
  { id: "features", label: "Features" },
  { id: "statistics", label: "Statistics" },
  { id: "about", label: "About" },
  { id: "contact", label: "Contact" },
];

function Navbar() {
  const [active, setActive] = useState("hero");

  useEffect(() => {
    function onScroll() {
      if (window.location.pathname !== "/") return;
      let current = "hero";
      for (const s of sections) {
        const el = document.getElementById(s.id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.top <= 150) current = s.id;
      }
      setActive(current);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function handleClick(e, id) {
    // If we're already on the landing page, do a smooth scroll without navigation
    if (window.location.pathname === "/") {
      e.preventDefault();
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    // Otherwise navigate to home with hash so the browser lands on the section
    // We intentionally use a normal navigation to avoid routing to other pages from Navbar
    // which keeps page routing only on the Experience Cards.
  }

  return (
    <nav className="navbar">
      <div className="logo">AI Puzzle Solver</div>

      <ul className="nav-links">
        {sections.map((s) => (
          <li key={s.id}>
            <a
              href={`/#${s.id}`}
              className={active === s.id ? "active" : ""}
              onClick={(e) => handleClick(e, s.id)}
            >
              {s.label}
            </a>
          </li>
        ))}
      </ul>

      <button
        className="nav-btn"
        onClick={() => {
          // CTA: navigate to experiences on the landing page
          if (window.location.pathname === "/") {
            const el = document.getElementById("features");
            if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
          } else {
            window.location.href = "/#features";
          }
        }}
      >
        Start Exploring
      </button>
    </nav>
  );
}

export default Navbar;