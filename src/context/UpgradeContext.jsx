import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import UpgradeModal from "../components/pro/UpgradeModal";

const UpgradeContext = createContext(null);

export function UpgradeProvider({ children }) {
  const [state, setState] = useState({ open: false, reason: "" });

  const openUpgrade = useCallback((reason = "") => {
    setState({ open: true, reason });
  }, []);

  const closeUpgrade = useCallback(() => {
    setState({ open: false, reason: "" });
  }, []);

  const value = useMemo(
    () => ({ openUpgrade, closeUpgrade }),
    [openUpgrade, closeUpgrade]
  );

  return (
    <UpgradeContext.Provider value={value}>
      {children}

      {state.open && (
        <UpgradeModal reason={state.reason} onClose={closeUpgrade} />
      )}
    </UpgradeContext.Provider>
  );
}

export function useUpgrade() {
  const context = useContext(UpgradeContext);

  if (!context) {
    throw new Error("useUpgrade must be used inside UpgradeProvider");
  }

  return context;
}