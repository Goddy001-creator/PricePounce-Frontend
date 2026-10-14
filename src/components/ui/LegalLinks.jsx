import { Link } from "react-router-dom";

export function SignupConsent() {
  return (
    <p className="legal-consent">
      By creating an account you agree to our{" "}
      <Link to="/terms" target="_blank" rel="noopener noreferrer">Terms of Service</Link> and{" "}
      <Link to="/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</Link>.
    </p>
  );
}

export function LegalLinks() {
  return (
    <div className="legal-links">
      <Link to="/terms">Terms</Link>
      <Link to="/privacy">Privacy</Link>
      <Link to="/refunds">Refunds</Link>
    </div>
  );
}