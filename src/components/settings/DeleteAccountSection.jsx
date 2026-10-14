import { useState } from "react";
import { deleteAccount } from "../../services/api";

export default function DeleteAccountSection() {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await deleteAccount(password);
      try { sessionStorage.clear(); } catch { /* ignore */ }
      window.location.href = "/login";
    } catch (err) {
      setError(err?.response?.data?.error || "Could not delete your account.");
      setBusy(false);
    }
  };

  return (
    <div className="danger-zone">
      <h3>Delete account</h3>
      <p>
        This permanently deletes your profile, watchlist and alerts. It cannot be
        undone. If you have Pro, your renewal is cancelled and any time left is lost.
      </p>

      {!open ? (
        <button type="button" className="danger-btn" onClick={() => setOpen(true)}>
          Delete account
        </button>
      ) : (
        <form onSubmit={handleDelete} className="danger-form">
          <label htmlFor="delete-password">Enter your password to confirm</label>
          <input
            id="delete-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="danger-error" role="alert">{error}</p>}
          <div className="danger-actions">
            <button type="submit" className="danger-btn" disabled={busy || !password}>
              {busy ? "Deleting..." : "Permanently delete my account"}
            </button>
            <button
              type="button"
              className="link-button"
              onClick={() => { setOpen(false); setPassword(""); setError(""); }}
              disabled={busy}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}