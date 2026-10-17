import { useEffect, useMemo, useState } from "react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

import { getRates } from "../services/api";

const NAMES = {
  USD: "US Dollar",
  GBP: "British Pound",
  EUR: "Euro",
  CNY: "Chinese Yuan",
  CAD: "Canadian Dollar",
  AED: "UAE Dirham",
  GHS: "Ghana Cedi",
  ZAR: "South African Rand",
};

function naira(value) {
  return `₦${Number(value).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function Change({ value }) {
  if (value === null || value === undefined) {
    return (
      <span className="rate-change flat">
        <Minus size={14} /> New
      </span>
    );
  }

  if (value === 0) {
    return (
      <span className="rate-change flat">
        <Minus size={14} /> 0%
      </span>
    );
  }

  const up = value > 0;

  return (
    <span className={`rate-change ${up ? "up" : "down"}`}>
      {up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
      {Math.abs(value)}%
    </span>
  );
}

function Rates() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState("1");
  const [code, setCode] = useState("USD");

  useEffect(() => {
    let active = true;

    getRates()
      .then((result) => {
        if (active) setData(result);
      })
      .catch(() => {
        if (active) setError("Could not load rates. Please try again shortly.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const rates = data?.rates || [];

  const converted = useMemo(() => {
    const rate = rates.find((item) => item.currency === code);
    const number = parseFloat(amount);

    if (!rate || Number.isNaN(number) || number < 0) return null;

    return number * rate.ngn_per_unit;
  }, [rates, code, amount]);

  return (
    <div className="rates-page">
      <div className="rates-head">
        <h1>Currency rates</h1>
        <p>
          Market rate in naira for one unit of each currency.
          {data?.date && ` Updated ${data.date}.`}
        </p>
      </div>

      {loading && <p className="rates-note">Loading rates...</p>}
      {error && <p className="rates-note rates-error">{error}</p>}

      {!loading && !error && rates.length === 0 && (
        <p className="rates-note">No rates yet. Check back soon.</p>
      )}

      {rates.length > 0 && (
        <>
          <div className="rates-grid">
            {rates.map((item) => (
              <button
                type="button"
                key={item.currency}
                className={`rate-card ${code === item.currency ? "selected" : ""}`}
                onClick={() => setCode(item.currency)}
              >
                <span className="rate-code">{item.currency}</span>
                <span className="rate-name">{NAMES[item.currency]}</span>
                <span className="rate-value">{naira(item.ngn_per_unit)}</span>
                <Change value={item.change_percent} />
              </button>
            ))}
          </div>

          <section className="rate-convert" aria-label="Converter">
            <h2>Quick converter</h2>

            <div className="rate-convert-row">
              <input
                type="number"
                inputMode="decimal"
                min="0"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                aria-label="Amount"
              />

              <select
                value={code}
                onChange={(event) => setCode(event.target.value)}
                aria-label="Currency"
              >
                {rates.map((item) => (
                  <option key={item.currency} value={item.currency}>
                    {item.currency}
                  </option>
                ))}
              </select>

              <span className="rate-convert-result">
                = {converted === null ? "-" : naira(converted)}
              </span>
            </div>
          </section>

          <p className="rates-credit">
            These are market rates, not street or bank rates.{" "}
            <a href={data.credit_url} target="_blank" rel="noopener noreferrer">
              {data.credit}
            </a>
          </p>
        </>
      )}
    </div>
  );
}

export default Rates;