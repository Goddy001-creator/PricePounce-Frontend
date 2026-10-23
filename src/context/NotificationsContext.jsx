import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useAuth } from "./AuthContext";
import {
  getCommunityNotifications,
  getPriceDrops,
  markCommunityNotificationsRead,
} from "../services/api";

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

  const [drops, setDrops] = useState([]);
  const [community, setCommunity] = useState([]);
  const [readIds, setReadIds] = useState(() => loadReadIds(storageKey));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Each account has its own read list for price drops
  useEffect(() => {
    setReadIds(loadReadIds(storageKey));
  }, [storageKey]);

  const loadNotifications = useCallback(async (silent = false) => {
    if (!silent) {
      setLoading(true);
    }

    setError(false);

    const [dropsResult, communityResult] = await Promise.allSettled([
      getPriceDrops(20),
      getCommunityNotifications(),
    ]);

    if (dropsResult.status === "fulfilled") {
      setDrops(
        (dropsResult.value.drops || []).map((drop) => ({
          id: `drop-${drop.product_id}-${drop.checked_at}`,
          type: "drop",
          productId: drop.product_id,
          productName: drop.product_name,
          imageUrl: drop.image_url,
          storeName: drop.store_name,
          oldPrice: Number(drop.old_price),
          newPrice: Number(drop.new_price),
          dropPercent: Number(drop.drop_percent),
          checkedAt: drop.checked_at,
        }))
      );
    } else if (!silent) {
      setDrops([]);
    }

    if (communityResult.status === "fulfilled") {
      setCommunity(
        (communityResult.value.notifications || []).map((item) => ({
          id: `c-${item.id}`,
          type: "community",
          rawId: item.id,
          kind: item.kind,
          postId: item.post_id,
          actor: item.actor,
          snippet: item.snippet,
          createdAt: item.created_at,
          read: item.read,
        }))
      );
    } else if (!silent) {
      setCommunity([]);
    }

    if (
      dropsResult.status === "rejected" &&
      communityResult.status === "rejected"
    ) {
      console.error("Notifications loading failed:", dropsResult.reason);
      setError(true);
    }

    setLoading(false);
  }, []);

  // Load now, then keep checking
  useEffect(() => {
    if (!user) {
      setDrops([]);
      setCommunity([]);
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

  // Replies and comments first, then price drops
  const notifications = useMemo(
    () => [...community, ...drops],
    [community, drops]
  );

  const isUnread = useCallback(
    (item) => (item.type === "community" ? !item.read : !readIds.includes(item.id)),
    [readIds]
  );

  const markRead = useCallback((id) => {
    if (typeof id === "string" && id.startsWith("c-")) {
      const rawId = Number(id.slice(2));

      setCommunity((prev) =>
        prev.map((item) => (item.id === id ? { ...item, read: true } : item))
      );

      markCommunityNotificationsRead({ ids: [rawId] }).catch(() => {});
      return;
    }

    setReadIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const markAllRead = useCallback(() => {
    setReadIds((prev) => [...new Set([...prev, ...drops.map((item) => item.id)])]);
    setCommunity((prev) => prev.map((item) => ({ ...item, read: true })));

    markCommunityNotificationsRead({ all: true }).catch(() => {});
  }, [drops]);

  const value = useMemo(
    () => ({
      notifications,
      readIds,
      isUnread,
      unreadCount: notifications.filter(isUnread).length,
      loading,
      error,
      markRead,
      markAllRead,
      reload: () => loadNotifications(),
    }),
    [notifications, readIds, isUnread, loading, error, markRead, markAllRead, loadNotifications]
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