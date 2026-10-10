import { Target } from "lucide-react";
import { useState } from "react";

import { useAuth } from "../../context/AuthContext";
import { useUpgrade } from "../../context/UpgradeContext";
import { setTargetPrice } from "../../services/api";

function TargetPrice({ product, onSaved }) {
  const { user } = useAuth();
  const { openUpgrade } = useUpgrade();

  const isPro = user?.plan === "pro";
  const saved = product.target_price ? Number(product.target_price) : null;

  const [value, setValue] = useState(saved ? String(saved) : "");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const reached =
    saved !== null && Number(product.current_price) <= saved;

  async function save(nextValue) {
    setBusy(true);
    setMessage("");

    try {
      const data = await setTargetPrice(product.id, nextValue);
      onSaved(product.id, data.target_price);
      setMessage(
        data.target_price === null ? "Alert removed." : "Alert saved."
      );
    } catch (requestError) {
      if (requestError.response?.data?.code === "pro_required") {
        openUpgrade("Get an email when this product reaches your target price.");
      } else {
        setMessage(
          requestError.response?.data?.error || "Couldn't save. Try again."
        );
      }
    } finally {
      setBusy(false);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!isPro) {
      openUpgrade("Get an email when this product reaches your target price.");
      return;
    }

    const number = Number(value);

    if (!value.trim() || !Number.isFinite(number) || number <= 0) {
      setMessage("Enter a price above 0.");
      return;
    }

    save(number);
  }

  function handleClear() {
    setValue("");
    save(null);
  }

  return (
    <form className="target-price" onSubmit={handleSubmit}>
      <Target size={15} />
      <label htmlFor={`target-${product.id}`}>Alert me at ₦</label>

      <input
        id={`target-${product.id}`}
        type="number"
        inputMode="decimal"
        min="1"
        step="any"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="e.g. 120000"
        readOnly={!isPro}
        onClick={() => {
          if (!isPro) {
            openUpgrade(
              "Get an email when this product reaches your target price."
            );
          }
        }}
      />

      <button type="submit" className="secondary-button" disabled={busy}>
        {busy ? "Saving..." : "Set"}
      </button>

      {saved !== null && (
        <button
          type="button"
          className="link-button"
          onClick={handleClear}
          disabled={busy}
        >
          Remove
        </button>
      )}

      {reached && <span className="target-reached">Target reached</span>}
      {message && <span className="target-message">{message}</span>}

      {!isPro && <span className="target-pro-tag">Pro</span>}
    </form>
  );
}

export default TargetPrice;