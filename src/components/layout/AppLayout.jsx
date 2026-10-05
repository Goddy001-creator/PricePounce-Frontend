import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";

import { NotificationsProvider } from "../../context/NotificationsContext";
import { UpgradeProvider } from "../../context/UpgradeContext";
import { WatchlistProvider } from "../../context/WatchlistContext";
import BottomNav from "./BottomNav";
import Header from "./Header";
import Sidebar from "./Sidebar";

function AppLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();

  // Close the drawer whenever the page changes
  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!drawerOpen) return undefined;

    function handleKeyDown(event) {
      if (event.key === "Escape") setDrawerOpen(false);
    }

    const desktopQuery = window.matchMedia("(min-width: 641px)");

    function handleResize(event) {
      if (event.matches) setDrawerOpen(false);
    }

    document.addEventListener("keydown", handleKeyDown);
    desktopQuery.addEventListener("change", handleResize);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      desktopQuery.removeEventListener("change", handleResize);
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  return (
    <NotificationsProvider>
      <WatchlistProvider>
        <UpgradeProvider>
          <div className="app-shell">
            <Sidebar
              open={drawerOpen}
              onClose={() => setDrawerOpen(false)}
            />

            {drawerOpen && (
              <div
                className="drawer-overlay"
                onClick={() => setDrawerOpen(false)}
              />
            )}

            <main className="main-area">
              <Header onMenuClick={() => setDrawerOpen(true)} />

              <div className="page-container">
                <Outlet />
              </div>
            </main>

            <BottomNav onMore={() => setDrawerOpen(true)} />
          </div>
        </UpgradeProvider>
      </WatchlistProvider>
    </NotificationsProvider>
  );
}

export default AppLayout;