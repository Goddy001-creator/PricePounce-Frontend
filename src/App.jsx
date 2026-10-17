import { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import {
  AdminRoute,
  PublicRoute,
  RequireAccount,
} from "./components/auth/RouteGuards";
import AppLayout from "./components/layout/AppLayout";
import SplashScreen from "./components/ui/SplashScreen";
import Terms from "./pages/legal/Terms";
import Privacy from "./pages/legal/Privacy";
import Refunds from "./pages/legal/Refunds";
import Rates from "./pages/Rates";

import About from "./pages/About";
import Alerts from "./pages/Alerts";
import Analytics from "./pages/Analytics";
import ComingSoon from "./pages/ComingSoon";
import Dashboard from "./pages/Dashboard";
import ForgotPassword from "./pages/ForgotPassword";
import Login from "./pages/Login";
import Notifications from "./pages/Notifications";
import ProductDetails from "./pages/ProductDetails";
import Products from "./pages/Products";
import ResetPassword from "./pages/ResetPassword";
import Settings from "./pages/Settings";
import Signup from "./pages/Signup";
import Stores from "./pages/Stores";
import VerifyEmail from "./pages/VerifyEmail";
import Watchlist from "./pages/Watchlist";
import Admin from "./pages/admin/Admin";
import AdminUserDetail from "./pages/admin/AdminUserDetail";

// Set VITE_COMING_SOON=true when building for the public site before launch
const COMING_SOON = import.meta.env.VITE_COMING_SOON === "true";

function App() {
  const [showSplash, setShowSplash] = useState(() => {
    return sessionStorage.getItem("pricepulse_splash_seen") !== "true";
  });

  useEffect(() => {
    if (!showSplash) {
      return;
    }

    const splashTimer = window.setTimeout(() => {
      sessionStorage.setItem("pricepulse_splash_seen", "true");
      setShowSplash(false);
    }, 1800);

    return () => {
      window.clearTimeout(splashTimer);
    };
  }, [showSplash]);

  if (COMING_SOON) {
    return <ComingSoon />;
  }

  return (
    <BrowserRouter>
      {showSplash && <SplashScreen />}

      <Routes>
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Route>

        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/refunds" element={<Refunds />} />

        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />

        {/* The layout works for visitors and members */}
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Open to visitors as a preview */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/about" element={<About />} />
          <Route path="/rates" element={<Rates />} />

          {/* Members only: visitors see the sign-up gate */}
          <Route element={<RequireAccount />}>
            <Route path="/products" element={<Products />} />
            <Route path="/products/:productId" element={<ProductDetails />} />
            <Route path="/watchlist" element={<Watchlist />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/stores" element={<Stores />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/settings" element={<Settings />} />

            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<Admin />} />
              <Route path="/admin/users/:userId" element={<AdminUserDetail />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;