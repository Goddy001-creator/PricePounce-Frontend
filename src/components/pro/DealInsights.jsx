import { Lock, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

import { useAuth } from "../../context/AuthContext";
import { useUpgrade } from "../../context/UpgradeContext";
import { getProductInsights } from "../../services/api";

const VERDICTS = {
  all_time_low: {
    label: "All-time low",
    text: "This is the lowest price we've recorded for this product.",
  },
  near_low: {
    label: "Near its lowest",
    text: "Within 3% of the lowest price we've recorded.",
  },
  good_deal: {
    label: "Good deal",
    text: "At least 10% below its average recorded price.",
  },
  fair: {
    label: "Fair price",
    text: "Close to its average recorded price.",
  },
  pricey: {
    label: "Pricier than usual",
    text: "At least 10% above its average recorded price. Waiting may pay off.",
  },
  not_enough_data: {
    label: "Not enough history yet",
    text: "We need a few more recorded prices before we can judge this deal.",
  },
};

function formatPrice(value) {
  if (value === null || value === undefined) return "—";
  return `₦${Number(value).toLocaleString()}`;
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function DealInsights({ productId }) {
  const { user } = useAuth();
  const { openUpgrade } = useUpgrade();

  const isPro = user?.plan === "pro";

  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!isPro) return undefined;

    let cancelled = false;

    setLoading(true);
    setError(false);

    getProductInsights(productId)
      .then((data) => {
        if (!cancelled) setInsights(data);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [productId, isPro]);

  if (!isPro) {
    return (
      <section className="content-card deal-insights locked">
        <div className="card-heading">
          <div>
            <h2>Deal Insights</h2>
            <p>Is now a good time to buy this?</p>
          </div>

          <span className="deal-pro-tag">Pro</span>
        </div>

        <div className="deal-locked">
          <Lock size={20} />
          <span>
            See the lowest price ever recorded, the average price and a
            clear good-deal signal.
          </span>

          <button
            type="button"
            className="primary-button"
            onClick={() =>
              openUpgrade("Unlock deal insights and the all-time low price.")
            }
          >
            Unlock with Pro
          </button>
        </div>
      </section>
    );
  }

  const verdict = insights ? VERDICTS[insights.verdict] : null;

  return (
    <section className="content-card deal-insights">
      <div className="card-heading">
        <div>
          <h2>Deal Insights</h2>
          <p>Is now a good time to buy this?</p>
        </div>

        <span className="deal-pro-tag">Pro</span>
      </div>

      {loading ? (
        <div className="loading-state">Checking this deal...</div>
      ) : error ? (
        <div className="history-table-empty">
          Couldn't load insights. Please try again later.
        </div>
      ) : verdict ? (
        <>
          <div className={`deal-verdict ${insights.verdict}`}>
            <Sparkles size={18} />
            <div>
              <strong>{verdict.label}</strong>
              <span>{verdict.text}</span>
            </div>
          </div>

          {insights.verdict !== "not_enough_data" && (
            <>
              <div className="insight-grid">
                <div>
                  <span>Lowest recorded</span>
                  <strong>{formatPrice(insights.lowest)}</strong>
                  <small>{formatDate(insights.lowest_date)}</small>
                </div>

                <div>
                  <span>Highest recorded</span>
                  <strong>{formatPrice(insights.highest)}</strong>
                </div>

                <div>
                  <span>Average recorded</span>
                  <strong>{formatPrice(insights.average)}</strong>
                </div>

                <div>
                  <span>Tracked since</span>
                  <strong>{formatDate(insights.tracked_since)}</strong>
                </div>
              </div>

              <p className="insight-note">
                Based on {insights.points} recorded prices. The average uses
                recorded price points, not the time spent at each price.
              </p>
            </>
          )}
        </>
      ) : null}
    </section>
  );
}

export default DealInsights;