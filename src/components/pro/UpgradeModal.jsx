import { Check, Crown, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { useAuth } from "../../context/AuthContext";
import {
  cancelSubscription,
  createCheckout,
  getBillingStatus,
} from "../../services/api";

// Keep these in sync with PLAN_LIMITS in the backend (app/security/plans.py)
const FREE_WATCHLIST = 10;
const PRO_WATCHLIST = 200;
const FREE_HISTORY_DAYS = 30;

const PRICES = {
  monthly: { amount: "₦2,000", note: "per month, billed monthly" },
  yearly: { amount: "₦1,680", note: "per month, billed ₦20,160 yearly" },
};

const FREE_FEATURES = [
  "Browse, search and compare prices",
  `Last ${FREE_HISTORY_DAYS} days of price history`,
  `Watchlist of up to ${FREE_WATCHLIST} products`,
  "In-app notifications",
];

const PRO_FEATURES = [
  { text: `Watchlist of up to ${PRO_WATCHLIST} products` },
  { text: "Full price history" },
  { text: "Instant price-drop alerts by email" },
  { text: "Target-price alerts" },
  { text: "Deal insights: all-time low and good-deal signal" },
  { text: "CSV export and weekly digest" },
  { text: "Priority price refresh for your watchlist", soon: true },
];

function formatDate(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function UpgradeModal({ reason, onClose }) {
  const { user } = useAuth();
  const isPro = user?.plan === "pro";

  const closeRef = useRef(null);
  const [interval, setInterval] = useState("yearly");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [billing, setBilling] = useState(null);
  const [cancelled, setCancelled] = useState(false);

  useEffect(() => {
    closeRef.current?.focus();

    function handleKeyDown(event) {
      if (event.key === "Escape") onClose();
    }

    const previousOverflow = document.body.style.overflow;

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  useEffect(() => {
    if (!isPro) return;

    getBillingStatus()
      .then(setBilling)
      .catch(() => {});
  }, [isPro]);

  async function handleUpgrade() {
    setBusy(true);
    setError("");

    try {
      const data = await createCheckout(interval);
      window.location.href = data.authorization_url;
    } catch (requestError) {
      setError(
        requestError.response?.data?.error ||
          "Couldn't start the payment. Please try again."
      );
      setBusy(false);
    }
  }

  async function handleCancel() {
    if (!window.confirm("Stop automatic renewal? Pro stays active until it expires.")) {
      return;
    }

    setBusy(true);
    setError("");

    try {
      await cancelSubscription();
      setCancelled(true);
      setBilling((current) => (current ? { ...current, renewing: false } : current));
    } catch (requestError) {
      setError(
        requestError.response?.data?.error ||
          "Couldn't cancel. Please try again."
      );
    } finally {
      setBusy(false);
    }
  }

  const price = PRICES[interval];

  return (
    <div className="pro-overlay" onClick={onClose}>
      <div
        className="pro-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pro-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          ref={closeRef}
          type="button"
          className="pro-close"
          onClick={onClose}
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <h2 id="pro-modal-title">
          {isPro ? "You're on PricePounce Pro" : "Upgrade to PricePounce Pro"}
        </h2>

        <p className="pro-subtitle">
          {reason ||
            "Track more products and get the tools that help you buy at the best price."}
        </p>

        <div className="plan-grid">
          <div className={`plan-card ${!isPro ? "current" : ""}`}>
            <div className="plan-card-head">
              <h3>Free</h3>
              {!isPro && <span className="plan-tag">Current plan</span>}
            </div>

            <div className="plan-price">₦0</div>

            <ul className="plan-features">
              {FREE_FEATURES.map((text) => (
                <li key={text}>
                  <Check size={15} />
                  <span>{text}</span>
                </li>
              ))}
            </ul>

            <button type="button" className="secondary-button plan-button" disabled>
              {!isPro ? "Your current plan" : "Free plan"}
            </button>
          </div>

          <div className={`plan-card pro ${isPro ? "current" : ""}`}>
            <div className="plan-card-head">
              <h3>
                <Crown size={16} />
                Pro
              </h3>
              <span className="plan-tag pro">
                {isPro ? "Current plan" : "Recommended"}
              </span>
            </div>

            {!isPro && (
              <div className="billing-toggle" role="group" aria-label="Billing period">
                <button
                  type="button"
                  className={interval === "monthly" ? "active" : ""}
                  onClick={() => setInterval("monthly")}
                >
                  Monthly
                </button>

                <button
                  type="button"
                  className={interval === "yearly" ? "active" : ""}
                  onClick={() => setInterval("yearly")}
                >
                  Yearly <em className="soon-chip">Save 16%</em>
                </button>
              </div>
            )}

            <div className="plan-price">
              {price.amount}
              <small className="plan-price-note">{price.note}</small>
            </div>

            <ul className="plan-features">
              {PRO_FEATURES.map((feature) => (
                <li key={feature.text}>
                  <Check size={15} />
                  <span>
                    {feature.text}
                    {feature.soon && <em className="soon-chip">Soon</em>}
                  </span>
                </li>
              ))}
            </ul>

            <button
              type="button"
              className="primary-button plan-button"
              onClick={handleUpgrade}
              disabled={isPro || busy}
            >
              {isPro
                ? "You're on Pro"
                : busy
                  ? "Opening checkout..."
                  : "Upgrade to Pro"}
            </button>

            {isPro && billing?.expires_at && (
              <p className="plan-notice">
                {billing.renewing
                  ? `Renews automatically on ${formatDate(billing.expires_at)}.`
                  : `Pro is active until ${formatDate(billing.expires_at)}.`}
              </p>
            )}

            {isPro && billing?.renewing && !cancelled && (
              <button
                type="button"
                className="link-button"
                onClick={handleCancel}
                disabled={busy}
              >
                Cancel automatic renewal
              </button>
            )}

            {cancelled && (
              <p className="plan-notice">
                Renewal cancelled. Pro stays active until it expires.
              </p>
            )}

            {!isPro && (
              <p className="plan-notice">
                Secure payment by Paystack. Cancel anytime.
              </p>
            )}

            {error && <p className="field-error">{error}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default UpgradeModal;