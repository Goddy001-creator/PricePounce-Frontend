import { useEffect } from "react";
import { Link } from "react-router-dom";
import { LEGAL } from "../../config/legal";

export function Section({ title, children }) {
  return (
    <section className="legal-section">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

export default function LegalLayout({ title, intro, children }) {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = `${title} | ${LEGAL.brand}`;
  }, [title]);

  return (
    <div className="legal-page">
      <header className="legal-header">
        <Link to="/dashboard" className="legal-brand">{LEGAL.brand}</Link>
        <nav className="legal-nav">
          <Link to="/terms">Terms</Link>
          <Link to="/privacy">Privacy</Link>
          <Link to="/refunds">Refunds</Link>
        </nav>
      </header>
      <main className="legal-body">
        <h1>{title}</h1>
        <p className="legal-updated">Last updated: {LEGAL.updated}</p>
        {intro && <p>{intro}</p>}
        {children}
      </main>
      <footer className="legal-footer">
        © {new Date().getFullYear()} {LEGAL.brand}. Questions? <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a>
      </footer>
    </div>
  );
}