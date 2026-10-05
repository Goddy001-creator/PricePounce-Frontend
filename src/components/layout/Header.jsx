import {
  Bell,
  CircleHelp,
  LogOut,
  Menu,
  Moon,
  Search,
  Settings as SettingsIcon,
  Sun,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationsContext";
import { useTheme } from "../../context/ThemeContext";

const PAGE_TITLES = {
  "/dashboard": "Dashboard",
  "/products": "Products",
  "/watchlist": "Watchlist",
  "/analytics": "Analytics",
  "/stores": "Stores",
  "/alerts": "Alerts",
  "/notifications": "Notifications",
  "/settings": "Settings",
  "/about": "About",
};

function getPageTitle(pathname) {
  if (pathname.startsWith("/products/")) return "Product Details";
  return PAGE_TITLES[pathname] || "PricePounce";
}

function Header({ onMenuClick = () => {} }) {
  const { isDark, setTheme } = useTheme();
  const { user, logout, updateSettings } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();

  const searchRef = useRef(null);
  const menuRef = useRef(null);
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (location.pathname === "/products") {
      setQuery(new URLSearchParams(location.search).get("q") || "");
    }
  }, [location.pathname, location.search]);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    function handleKeyDown(event) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.select();
      }

      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    }

    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  function handleSearchSubmit(event) {
    event.preventDefault();
    const trimmed = query.trim();
    navigate(trimmed ? `/products?q=${encodeURIComponent(trimmed)}` : "/products");
    searchRef.current?.blur();
  }

  function handleThemeToggle() {
    const next = isDark ? "light" : "dark";

    setTheme(next);

    updateSettings({ theme: next }).catch((error) => {
      console.error("Saving theme failed:", error);
    });
  }

  const firstName = (user?.name || "").split(" ")[0];

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

      <span className="topbar-title">{getPageTitle(location.pathname)}</span>

      <form className="header-search" role="search" onSubmit={handleSearchSubmit}>
        <Search size={19} />
        <input
          ref={searchRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for products..."
          aria-label="Search for products"
        />
        <span className="shortcut">Ctrl + K</span>
      </form>

      <div className="header-actions">
        <Link
          to="/notifications"
          className="icon-button notification-button"
          aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
        >
          <Bell size={19} />
          {unreadCount > 0 && (
            <span className="notification-dot">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Link>

        <button
          type="button"
          className="icon-button theme-toggle"
          onClick={handleThemeToggle}
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDark ? <Sun size={19} /> : <Moon size={19} />}
        </button>

        <div className="account-menu" ref={menuRef}>
          <button
            type="button"
            className="user-profile account-trigger"
            onClick={() => setMenuOpen((open) => !open)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
          >
            <div className="avatar">
              {(user?.name || "?").charAt(0).toUpperCase()}
            </div>
            <div>
              <strong>{firstName}</strong>
              <small>Account</small>
            </div>
          </button>

          {menuOpen && (
            <div className="account-dropdown" role="menu">
              <div className="account-dropdown-header">
                <strong>{user?.name}</strong>
                <span>{user?.email}</span>
              </div>

              <Link to="/settings" role="menuitem">
                <SettingsIcon size={16} />
                Settings
              </Link>

              <Link to="/notifications" role="menuitem">
                <Bell size={16} />
                Notifications
              </Link>

              <Link to="/about" role="menuitem">
                <CircleHelp size={16} />
                About
              </Link>

              <button
                type="button"
                className="account-dropdown-button"
                role="menuitem"
                onClick={logout}
              >
                <LogOut size={16} />
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;