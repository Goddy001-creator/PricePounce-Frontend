import { Lock } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

function GatePage() {
  const location = useLocation();

  return (
    <div className="page">
      <div className="content-card gate-card">
        <div className="gate-icon">
          <Lock size={26} />
        </div>

        <h2>Create a free account to see this</h2>

        <p>
          Prices, price history and your watchlist are for members. Sign up
          free in under a minute, or log in if you already have an account.
        </p>

        <div className="gate-actions">
          <Link to="/signup" state={{ from: location }} className="primary-button">
            Sign up free
          </Link>

          <Link to="/login" state={{ from: location }} className="secondary-button">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}

export default GatePage;