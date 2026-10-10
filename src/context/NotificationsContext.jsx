import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useAuth } from "./AuthContext";
import { getPriceDrops } from "../services/api";

const STORAGE_PREFIX = "pricepounce_read_notifications_";
const REFRESH_MS = 60 * 1000;

function storageKeyFor(user) {
  return user ? `${STORAGE_PREFIX}${user.id}` : null;
}

function loadReadIds(key) {
  if (!key) {
    return [];
  }

  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch {
    return [];
  }
}

const NotificationsContext = createContext(null);

export function NotificationsProvider({ children }) {
  const { user } = useAuth();
  const storageKey = storageKeyFor(user);

  const [notifications, setNotifications] = useState([]);
  const [readIds, setReadIds] = useState(() => loadReadIds(storageKey));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Each account has its own read list
  useEffect(() => {
    setReadIds(loadReadIds(storageKey));
  }, [storageKey]);

  const loadNotifications = useCallback(async (silent = false) => {
    if (!silent) {
      setLoading(true);
    }

    setError(false);

    try {
      const data = await getPriceDrops(20);

      const items = (data.drops || []).map((drop) => ({
        id: `drop-${drop.product_id}-${drop.checked_at}`,
        productId: drop.product_id,
        productName: drop.product_name,
        imageUrl: drop.image_url,
        storeName: drop.store_name,
        oldPrice: Number(drop.old_price),
        newPrice: Number(drop.new_price),
        dropPercent: Number(drop.drop_percent),
        checkedAt: drop.checked_at,
      }));

      setNotifications(items);
    } catch (requestError) {
      console.error("Notifications loading failed:", requestError);
      setError(true);

      if (!silent) {
        setNotifications([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Load now, then keep checking
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return undefined;
    }

    loadNotifications();

    const timer = window.setInterval(() => {
      loadNotifications(true);
    }, REFRESH_MS);

    function handleVisible() {
      if (document.visibilityState === "visible") {
        loadNotifications(true);
      }
    }

    document.addEventListener("visibilitychange", handleVisible);

    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", handleVisible);
    };
  }, [user, loadNotifications]);

  useEffect(() => {
    if (!storageKey) {
      return;
    }

    try {
      localStorage.setItem(storageKey, JSON.stringify(readIds.slice(-200)));
    } catch {
      // ignore storage errors
    }
  }, [readIds, storageKey]);

  const markRead = useCallback((id) => {
    setReadIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const markAllRead = useCallback(() => {
    setReadIds((prev) => [
      ...new Set([...prev, ...notifications.map((item) => item.id)]),
    ]);
  }, [notifications]);

  const value = useMemo(
    () => ({
      notifications,
      readIds,
      unreadCount: notifications.filter(
        (item) => !readIds.includes(item.id)
      ).length,
      loading,
      error,
      markRead,
      markAllRead,
      reload: () => loadNotifications(),
    }),
    [notifications, readIds, loading, error, markRead, markAllRead, loadNotifications]
  );

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationsContext);

  if (!context) {
    throw new Error("useNotifications must be used inside NotificationsProvider");
  }

  return context;
}