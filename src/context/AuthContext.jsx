import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getMe,
  login as loginRequest,
  logout as logoutRequest,
  setCsrfToken,
  updateProfile as updateProfileRequest,
  updateSettings as updateSettingsRequest,
} from "../services/api";
import { loginTwoFactor } from "../services/authApi";
import { useTheme } from "./ThemeContext";

const AUTO_REFRESH_KEY = "pricepulse_auto_refresh";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const { setTheme } = useTheme();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const applySettings = useCallback(
    (settings) => {
      if (!settings) return;

      if (settings.theme === "light" || settings.theme === "dark") {
        setTheme(settings.theme);
      }

      try {
        localStorage.setItem(
          AUTO_REFRESH_KEY,
          String(settings.auto_refresh_minutes)
        );
      } catch {
        // storage unavailable
      }
    },
    [setTheme]
  );

  const startSession = useCallback(
    (data) => {
      setCsrfToken(data.csrf_token);
      setUser(data.user);
      applySettings(data.user.settings);
    },
    [applySettings]
  );

  // Restore the session on page load
  useEffect(() => {
    let cancelled = false;

    async function loadUser() {
      try {
        const data = await getMe();

        if (cancelled) return;

        startSession(data);
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadUser();

    return () => {
      cancelled = true;
    };
  }, [startSession]);

  // Any 401 from the API means the session ended
  useEffect(() => {
    function handleUnauthorized() {
      setCsrfToken("");
      setUser(null);
    }

    window.addEventListener("pricepounce:unauthorized", handleUnauthorized);

    return () =>
      window.removeEventListener(
        "pricepounce:unauthorized",
        handleUnauthorized
      );
  }, []);

  // Returns { mfaRequired, mfaToken } when a second step is needed
  const login = useCallback(
    async (email, password) => {
      const data = await loginRequest(email, password);

      if (data.mfa_required) {
        return { mfaRequired: true, mfaToken: data.mfa_token };
      }

      startSession(data);

      return { mfaRequired: false };
    },
    [startSession]
  );

  const completeTwoFactorLogin = useCallback(
    async (mfaToken, code) => {
      const data = await loginTwoFactor(mfaToken, code);

      startSession(data);
    },
    [startSession]
  );

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } catch (error) {
      console.error("Logout request failed:", error);
    }

    setCsrfToken("");
    setUser(null);
  }, []);

  const updateSettings = useCallback(
    async (partial) => {
      const data = await updateSettingsRequest(partial);

      setUser(data.user);
      applySettings(data.user.settings);

      return data.user;
    },
    [applySettings]
  );

  const updateProfile = useCallback(async (name) => {
    const data = await updateProfileRequest(name);

    setUser(data.user);

    return data.user;
  }, []);

  // Used after changes the server reports back (for example enabling 2FA)
  const applyUser = useCallback((nextUser) => {
    setUser(nextUser);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAdmin: user?.role === "admin",
      login,
      completeTwoFactorLogin,
      logout,
      updateSettings,
      updateProfile,
      applyUser,
    }),
    [
      user,
      loading,
      login,
      completeTwoFactorLogin,
      logout,
      updateSettings,
      updateProfile,
      applyUser,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}