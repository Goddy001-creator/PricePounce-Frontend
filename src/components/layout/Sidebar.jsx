import {
  BarChart3,
  Bell,
  Bookmark,
  CircleHelp,
  Crown,
  LayoutDashboard,
  LogOut,
  Package,
  Settings as SettingsIcon,
  Shield,
  Store,
  X,
} from "lucide-react";
import { NavLink } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { useUpgrade } from "../../context/UpgradeContext";
import Logo from "../ui/Logo";

const navigation = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Products",
    path: "/products",
    icon: Package,
  },
  {
    label: "Watchlist",
    path: "/watchlist",
    icon: Bookmark,
  },
  {
    label: "Analytics",
    path: "/analytics",
    icon: BarChart3,
  },
  {
    label: "Stores",
    path: "/stores",
    icon: Store,
  },
  {
    label: "Alerts",
    path: "/alerts",
    icon: Bell,
  },
  {
    label: "Admin",
    path: "/admin",
    icon: Shield,
    adminOnly: true,
  },
  {
    label: "Settings",
    path: "/settings",
    icon: SettingsIcon,
  },
  {
    label: "About",
    path: "/about",
    icon: CircleHelp,
  },
];

function Sidebar({ open = false, onClose = () => {} }) {
  const { user, isAdmin, logout } = useAuth();
  const { openUpgrade } = useUpgrade();

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
          {items.map(({ label, path, icon: Icon }) => (
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
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="sidebar-bottom">
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

        <button
          className="logout-button"
          onClick={logout}
          title="Logout"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;