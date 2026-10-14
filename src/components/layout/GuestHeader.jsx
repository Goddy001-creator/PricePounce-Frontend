import { Menu, Moon, Sun } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

import { useTheme } from "../../context/ThemeContext";

const PAGE_TITLES = {
  "/dashboard": "Dashboard",
  "/about": "About",
};

function GuestHeader({ onMenuClick = () => {} }) {
  const { isDark, setTheme } = useTheme();
  const location = useLocation();

  return (
    <header className="topbar">
      <button
        type="button"
        className="icon-button menu-button"
        onClick={onMenuClick}
        aria-label="Open menu"
      >
        <Menu size={22} />
      </button>

      <span className="topbar-title">
        {PAGE_TITLES[location.pathname] || "PricePounce"}
      </span>

      <div className="header-actions guest-actions">
        <button
          type="button"
          className="icon-button theme-toggle"
          onClick={() => setTheme(isDark ? "light" : "dark")}
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDark ? <Sun size={19} /> : <Moon size={19} />}
        </button>

        <Link to="/login" className="secondary-button">
          Log in
        </Link>

        <Link to="/signup" className="primary-button">
          Sign up
        </Link>
      </div>
    </header>
  );
}

export default GuestHeader;