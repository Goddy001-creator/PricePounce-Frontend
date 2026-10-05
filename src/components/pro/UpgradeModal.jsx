import { Check, Crown, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { useAuth } from "../../context/AuthContext";

// Keep these in sync with PLAN_LIMITS in the backend (app/security/plans.py)
const FREE_WATCHLIST = 10;
const PRO_WATCHLIST = 200;
const FREE_HISTORY_DAYS = 30;

// Fill these in when pricing and payments are ready
const PRO_PRICE_LABEL = ""; // for example "₦2,000 / month"
const SUPPORT_EMAIL = ""; // for example "support@yourdomain.com"

const FREE_FEATURES = [
  "Browse, search and compare prices",
  `Last ${FREE_HISTORY_DAYS} days of price history`,
  `Watchlist of up to ${FREE_WATCHLIST} products`,
  "In-app notifications",
];

const PRO_FEATURES = [
  { text: `Watchlist of up to ${PRO_WATCHLIST} products` },
  { text: "Full price history" },
  { text: "Instant price-drop alerts by email", soon: true },
  { text: "Target-price and back-in-stock alerts", soon: true },
  { text: "Priority price refresh for your watchlist", soon: true },
  { text: "Deal insights: all-time low and good-deal signal", soon: true },
  { text: "CSV export and weekly digest", soon: true },
];

function UpgradeModal({ reason, onClose }) {
  const { user } = useAuth();
  const isPro = user?.plan === "pro";

  const closeRef = useRef(null);
  const [notice, setNotice] = useState(false);

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

  function handleUpgrade() {
    setNotice(true);

    if (SUPPORT_EMAIL) {
      const subject = encodeURIComponent("Upgrade to PricePounce Pro");
      const body = encodeURIComponent(
        `Hi, I'd like to upgrade to Pro. My account email is ${user?.email}.`
      );

      window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
    }
  }

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

            <div className="plan-price">
              {PRO_PRICE_LABEL || "Pricing coming soon"}
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
              disabled={isPro}
            >
              {isPro ? "You're on Pro" : "Upgrade to Pro"}
            </button>

            {notice && !isPro && (
              <p className="plan-notice">
                {SUPPORT_EMAIL
                  ? "Online payments are coming soon. For now Pro is activated manually, so send us the email that just opened."
                  : "Online payments are coming soon."}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default UpgradeModal;