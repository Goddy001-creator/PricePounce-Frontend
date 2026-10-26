import { useState } from "react";

import { useAuth } from "../../context/AuthContext";
import { reportCommunity } from "../../services/api";

const REASONS = [
  { value: "wrong_price", label: "Wrong or fake price" },
  { value: "spam", label: "Spam or advert" },
  { value: "scam", label: "Scam" },
  { value: "abuse", label: "Abusive or offensive" },
  { value: "other", label: "Something else" },
];

function ReportButton({ targetType, targetId }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("wrong_price");
  const [details, setDetails] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);

  if (!user) return null;

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setFailed(false);

    try {
      const data = await reportCommunity(targetType, targetId, reason, details);
      setMessage(data.message);
      setOpen(false);
    } catch (err) {
      setFailed(true);
      setMessage(err.response?.data?.error || "Could not send the report.");
    } finally {
      setBusy(false);
    }
  }

  if (message && !failed) {
    return <span className="cm-report-done">{message}</span>;
  }

  return (
    <>
      <button
        type="button"
        className="cm-link"
        onClick={() => setOpen((value) => !value)}
      >
        Report
      </button>

      {failed && <span className="cm-report-error">{message}</span>}

      {open && (
        <form className="cm-report" onSubmit={submit}>
          <select
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            aria-label="Reason for report"
          >
            {REASONS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>

          <input
            type="text"
            value={details}
            maxLength={300}
            placeholder="Add details (optional)"
            onChange={(event) => setDetails(event.target.value)}
          />

          <button type="submit" className="cm-report-send" disabled={busy}>
            {busy ? "Sending..." : "Send report"}
          </button>
          <button
            type="button"
            className="cm-link"
            onClick={() => setOpen(false)}
          >
            Cancel
          </button>
        </form>
      )}
    </>
  );
}

export default ReportButton;