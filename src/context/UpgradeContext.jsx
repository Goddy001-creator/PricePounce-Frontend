import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import UpgradeModal from "../components/pro/UpgradeModal";
import { verifyPayment } from "../services/api";

const UpgradeContext = createContext(null);

const PAID_FLAG = "pp_just_paid";
const PENDING_REF = "pp_pending_ref";
const NOT_CONFIRMED =
  "We couldn't confirm your payment yet. If you were charged, Pro will activate shortly.";

export function UpgradeProvider({ children }) {
  const [state, setState] = useState({ open: false, reason: "" });
  const handled = useRef(false);

  const openUpgrade = useCallback((reason = "") => {
    setState({ open: true, reason });
  }, []);

  const closeUpgrade = useCallback(() => {
    setState({ open: false, reason: "" });
  }, []);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    let justPaid = false;
    let reference = null;

    try {
      justPaid = sessionStorage.getItem(PAID_FLAG) === "1";
      sessionStorage.removeItem(PAID_FLAG);
      reference = sessionStorage.getItem(PENDING_REF);
    } catch {
      // storage unavailable
    }

    if (justPaid) {
      setState({ open: true, reason: "Payment received. Welcome to Pro!" });
      return;
    }

    if (!reference) return;

    verifyPayment(reference)
      .then((data) => {
        try {
          sessionStorage.removeItem(PENDING_REF);
        } catch {
          // storage unavailable
        }

        if (data.paid) {
          try {
            sessionStorage.setItem(PAID_FLAG, "1");
          } catch {
            // storage unavailable
          }

          // Reload so the whole app picks up the new Pro plan
          window.location.reload();
        } else {
          setState({ open: true, reason: NOT_CONFIRMED });
        }
      })
      .catch((error) => {
        // Not signed in yet: keep the reference and try on the next load
        if (error.response?.status === 401) return;

        console.error("Payment verification failed", error);

        try {
          sessionStorage.removeItem(PENDING_REF);
        } catch {
          // storage unavailable
        }

        setState({ open: true, reason: NOT_CONFIRMED });
      });
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