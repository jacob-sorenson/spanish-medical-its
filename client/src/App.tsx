import { useEffect, useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import "./App.css";

const pageLinks = [
  { label: "Learn", to: "/learn", className: "nav-card learn-card" },
  { label: "Practice", to: "/practice", className: "nav-card practice-card" },
  { label: "Dashboard", to: "/dashboard", className: "nav-card dashboard-card" },
];

const THEME_STORAGE_KEY = "spanish-its-theme";

const getInitialTheme = () => {
  if (typeof window === "undefined") {
    return "light";
  }

  const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (savedTheme === "dark" || savedTheme === "light") {
    return savedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

function HomePage() {
  return (
    <main className="page-shell home-shell">
      <div className="hero-copy">
        <p className="eyebrow">Spanish ITS</p>
        <h1>Spanish Medical Terms Tutor</h1>
        <p className="hero-text">
          Choose a learning mode to study vocabulary, practice recall, and track
          your progress across the tutoring system.
        </p>
      </div>

      <div className="triangle-grid" aria-label="Main navigation">
        {pageLinks.map((link) => (
          <Link key={link.to} to={link.to} className={link.className}>
            <span>{link.label}</span>
          </Link>
        ))}
      </div>
    </main>
  );
}

function RootLayout() {
  const [theme, setTheme] = useState<"light" | "dark">(getInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  return (
    <>
      <header className="app-header">
        <Link to="/" className="brand-link">
          Spanish ITS
        </Link>
        <nav className="top-nav" aria-label="Primary">
          <NavLink to="/learn" className="top-nav-link">
            Learn
          </NavLink>
          <NavLink to="/practice" className="top-nav-link">
            Practice
          </NavLink>
          <NavLink to="/dashboard" className="top-nav-link">
            Dashboard
          </NavLink>
          <button
            type="button"
            className="theme-toggle"
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            aria-pressed={theme === "dark"}
            onClick={() => {
              setTheme((currentTheme) =>
                currentTheme === "dark" ? "light" : "dark",
              );
            }}
          >
            {theme === "dark" ? "Light Mode" : "Dark Mode"}
          </button>
        </nav>
      </header>
      <Outlet />
    </>
  );
}

export { HomePage };
export default RootLayout;
