import {
  BarChart3,
  Bell,
  LayoutDashboard,
  LayoutGrid,
  Package,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const TABS = [
  { label: "Home", path: "/dashboard", icon: LayoutDashboard },
  { label: "Products", path: "/products", icon: Package },
  { label: "Analytics", path: "/analytics", icon: BarChart3 },
  { label: "Alerts", path: "/alerts", icon: Bell },
];

function BottomNav({ onMore }) {
  return (
    <nav className="bottom-nav" aria-label="Main">
      {TABS.map(({ label, path, icon: Icon }) => (
        <NavLink
          key={path}
          to={path}
          className={({ isActive }) =>
            `bottom-nav-item ${isActive ? "active" : ""}`
          }
        >
          <Icon size={20} strokeWidth={1.8} />
          <span>{label}</span>
        </NavLink>
      ))}

      <button
        type="button"
        className="bottom-nav-item"
        onClick={onMore}
        aria-label="More menu"
      >
        <LayoutGrid size={20} strokeWidth={1.8} />
        <span>More</span>
      </button>
    </nav>
  );
}

export default BottomNav;