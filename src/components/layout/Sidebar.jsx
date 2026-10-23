import {
  BarChart3,
  Bell,
  Bookmark,
  CircleHelp,
  Coins,
  Crown,
  LayoutDashboard,
  Lock,
  LogOut,
  Package,
  Settings as SettingsIcon,
  Shield,
  Store,
  Users,
  X,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { useUpgrade } from "../../context/UpgradeContext";
import Logo from "../ui/Logo";
import { LegalLinks } from "../ui/LegalLinks";

const navigation = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Currency", path: "/rates", icon: Coins },
  { label: "Community", path: "/community", icon: Users },
  { label: "Products", path: "/products", icon: Package, members: true },
  { label: "Watchlist", path: "/watchlist", icon: Bookmark, members: true },
  { label: "Analytics", path: "/analytics", icon: BarChart3, members: true },
  { label: "Stores", path: "/stores", icon: Store, members: true },
  { label: "Alerts", path: "/alerts", icon: Bell, members: true },
  { label: "Admin", path: "/admin", icon: Shield, adminOnly: true },
  { label: "Settings", path: "/settings", icon: SettingsIcon, members: true },
  { label: "About", path: "/about", icon: CircleHelp },
];

function Sidebar({ open = false, onClose = () => {} }) {
  const { user, isAdmin, logout } = useAuth();
  const { openUpgrade } = useUpgrade();
  const navigate = useNavigate();

  const items = navigation.filter((item) => !item.adminOnly || isAdmin);

  return (
    <aside className={`sidebar ${open ? "open" : ""}`}>
      <button
        type="button"
        className="sidebar-close"
        onClick={onClose}
        aria-label="Close menu"
      >
        <X size={18} />
      </button>

      <div className="sidebar-top">
        <Logo light />

        <nav className="sidebar-nav">
          {items.map(({ label, path, icon: Icon, members }) => (
            <NavLink
              key={label}
              to={path}
              title={label}
              className={({ isActive }) =>
                `nav-item ${isActive ? "active" : ""}`
              }
            >
              <Icon size={19} strokeWidth={1.8} />
              <span>{label}</span>
              {!user && members && (
                <Lock size={13} className="nav-lock" aria-label="Members only" />
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="sidebar-bottom">
        {!user && (
          <div className="upgrade-card">
            <div className="upgrade-card-title">
              <Crown size={16} />
              Join free
            </div>

            <p>Track prices, set alerts and see full price history.</p>

            <button
              type="button"
              onClick={() => {
                onClose();
                navigate("/signup");
              }}
            >
              Sign up
            </button>
          </div>
        )}

        {user?.plan === "free" && (
          <div className="upgrade-card">
            <div className="upgrade-card-title">
              <Crown size={16} />
              Go Pro
            </div>

            <p>Bigger watchlist, full price history and more.</p>

            <button
              type="button"
              onClick={() => {
                onClose();
                openUpgrade("");
              }}
            >
              See plans
            </button>
          </div>
        )}

        {user ? (
          <button className="logout-button" onClick={logout} title="Logout">
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        ) : (
          <button
            className="logout-button"
            onClick={() => {
              onClose();
              navigate("/login");
            }}
            title="Log in"
          >
            <LogOut size={18} />
            <span>Log in</span>
          </button>
        )}
      </div>
      <LegalLinks />
    </aside>
  );
}

export default Sidebar;