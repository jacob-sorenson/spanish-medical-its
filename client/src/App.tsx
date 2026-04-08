import { Link, Outlet } from "react-router-dom";
import "./App.css";

const pageLinks = [
  { label: "Learn", to: "/learn", className: "nav-card learn-card" },
  { label: "Practice", to: "/practice", className: "nav-card practice-card" },
  { label: "Dashboard", to: "/dashboard", className: "nav-card dashboard-card" },
];

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

type PlaceholderPageProps = {
  title: string;
};

function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <main className="page-shell placeholder-shell">
      <Link to="/" className="back-link">
        Back To Home
      </Link>
      <section className="placeholder-panel" aria-labelledby="page-title">
        <p className="eyebrow">Spanish ITS</p>
        <h1 id="page-title" className="placeholder-title">
          {title}
        </h1>
      </section>
    </main>
  );
}

export function LearnPage() {
  return <PlaceholderPage title="Learn" />;
}

export function PracticePage() {
  return <PlaceholderPage title="Practice" />;
}

export function DashboardPage() {
  return <PlaceholderPage title="Dashboard" />;
}

function App() {
  return <Outlet />;
}

export { HomePage };
export default App;
