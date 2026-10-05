import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  addToWatchlist,
  getWatchlistIds,
  removeFromWatchlist,
} from "../services/api";

const WatchlistContext = createContext(null);

export function WatchlistProvider({ children }) {
  const [ids, setIds] = useState([]);

  const reload = useCallback(async () => {
    try {
      const data = await getWatchlistIds();
      setIds(data.ids || []);
    } catch (error) {
      console.error("Watchlist loading failed:", error);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const isWatching = useCallback(
    (productId) => ids.includes(productId),
    [ids]
  );

  // Updates the screen immediately, then rolls back if the server refuses
  const toggle = useCallback(
    async (productId) => {
      const watching = ids.includes(productId);

      setIds((previous) =>
        watching
          ? previous.filter((id) => id !== productId)
          : [productId, ...previous]
      );

      try {
        if (watching) {
          await removeFromWatchlist(productId);
        } else {
          await addToWatchlist(productId);
        }

        return !watching;
      } catch (error) {
        setIds((previous) =>
          watching
            ? [productId, ...previous]
            : previous.filter((id) => id !== productId)
        );

        throw error;
      }
    },
    [ids]
  );

  const value = useMemo(
    () => ({ ids, count: ids.length, isWatching, toggle, reload }),
    [ids, isWatching, toggle, reload]
  );

  return (
    <WatchlistContext.Provider value={value}>
      {children}
    </WatchlistContext.Provider>
  );
}

export function useWatchlist() {
  const context = useContext(WatchlistContext);

  if (!context) {
    throw new Error("useWatchlist must be used inside WatchlistProvider");
  }

  return context;
}