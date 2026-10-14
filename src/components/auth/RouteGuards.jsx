import { Link, Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import GatePage from "../ui/GatePage";

export function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="auth-loading">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

export function PublicRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="auth-loading">Loading...</div>;
  }

  if (user) {
    return (
      <Navigate
        to={location.state?.from?.pathname || "/dashboard"}
        replace
      />
    );
  }

  return <Outlet />;
}

// Used inside the app layout. The server still enforces every admin rule.
export function AdminRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="auth-loading">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  if (!user.totp_enabled) {
    return (
      <div className="page">
        <div className="content-card">
          <h2>Two-factor authentication required</h2>
          <p className="twofa-text">
            Admin access needs two-factor authentication. Turn it on in
            Settings, then come back here.
          </p>

          <Link to="/settings" className="primary-button">
            Go to Settings
          </Link>
        </div>
      </div>
    );
  }

  return <Outlet />;
}

// Shows the sign-up gate (inside the normal layout) instead of redirecting
export function RequireAccount() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="auth-loading">Loading...</div>;
  }

  if (!user) {
    return <GatePage />;
  }

  return <Outlet />;
}