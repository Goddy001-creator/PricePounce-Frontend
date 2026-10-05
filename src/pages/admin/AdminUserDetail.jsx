import { ArrowLeft } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import {
  deleteUser,
  forceLogoutUser,
  getAdminUser,
  setUserPlan,
  suspendUser,
  unlockUser,
  unsuspendUser,
  verifyUserEmail,
} from "../../services/adminApi";
import { formatDate, formatDateTime, timeAgo } from "../../utils/dates";

function Info({ label, children }) {
  return (
    <div className="admin-info">
      <span>{label}</span>
      <strong>{children}</strong>
    </div>
  );
}

function describeDetails(details) {
  if (!details) return "";

  return Object.entries(details)
    .map(([key, value]) => `${key}: ${value}`)
    .join(", ");
}

function AdminUserDetail() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: me } = useAuth();

  const [user, setUser] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [busy, setBusy] = useState("");
  const [feedback, setFeedback] = useState({ type: "", message: "" });
  const [grant, setGrant] = useState("30");
  const [confirmEmail, setConfirmEmail] = useState("");

  const load = useCallback(async () => {
    try {
      const data = await getAdminUser(userId);
      setUser(data.user);
      setActivity(data.activity || []);
      setError("");
    } catch (requestError) {
      console.error("Admin user failed:", requestError);
      setError(requestError.response?.data?.error || "Unable to load this user.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  async function run(key, request, confirmText) {
    if (confirmText && !window.confirm(confirmText)) return;

    setBusy(key);
    setFeedback({ type: "", message: "" });

    try {
      const data = await request();

      setFeedback({ type: "success", message: data.message || "Done." });
      await load();
    } catch (requestError) {
      setFeedback({
        type: "error",
        message: requestError.response?.data?.error || "That action failed.",
      });
    } finally {
      setBusy("");
    }
  }

  async function handleDelete(event) {
    event.preventDefault();

    setBusy("delete");
    setFeedback({ type: "", message: "" });

    try {
      await deleteUser(user.id, confirmEmail);
      navigate("/admin?tab=users", { replace: true });
    } catch (requestError) {
      setFeedback({
        type: "error",
        message: requestError.response?.data?.error || "Couldn't delete this account.",
      });
      setBusy("");
    }
  }

  if (loading) {
    return (
      <div className="page">
        <div className="loading-state">Loading user...</div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="page">
        <Link to="/admin?tab=users" className="back-button">
          <ArrowLeft size={17} />
          Back to users
        </Link>

        <div className="content-card">
          <div className="empty-state">{error || "User not found."}</div>
        </div>
      </div>
    );
  }

  const isSelf = me?.id === user.id;
  const isAdminTarget = user.role === "admin";
  const protectedAccount = isSelf || isAdminTarget;

  const planText =
    user.plan === "pro"
      ? user.plan_expires_at
        ? `Pro until ${formatDate(user.plan_expires_at)}`
        : "Pro (lifetime)"
      : "Free";

  return (
    <div className="page">
      <Link to="/admin?tab=users" className="back-button">
        <ArrowLeft size={17} />
        Back to users
      </Link>

      {feedback.message && (
        <div className={`settings-feedback ${feedback.type}`}>
          {feedback.message}
        </div>
      )}

      <div className="admin-detail-grid">
        <div className="admin-detail-main">
          <section className="content-card">
            <div className="admin-profile">
              <div className="avatar admin-avatar">
                {user.name.charAt(0).toUpperCase()}
              </div>

              <div>
                <h2>{user.name}</h2>
                <p>{user.email}</p>

                <div className="admin-badges">
                  <span className={`plan-badge ${user.plan}`}>
                    {user.plan === "pro" ? "Pro" : "Free"}
                  </span>
                  <span className={`status-badge ${user.status}`}>
                    {user.status === "active" ? "Active" : "Suspended"}
                  </span>
                  {isAdminTarget && <span className="mini-badge admin">Admin</span>}
                  {isSelf && <span className="mini-badge ok">You</span>}
                </div>
              </div>
            </div>

            <div className="admin-info-grid">
              <Info label="Joined">{formatDateTime(user.created_at)}</Info>
              <Info label="Last login">
                {user.last_login_at ? timeAgo(user.last_login_at) : "Never"}
              </Info>
              <Info label="Email">
                {user.email_verified ? "Verified" : "Not verified"}
              </Info>
              <Info label="Two-factor">{user.totp_enabled ? "On" : "Off"}</Info>
              <Info label="Plan">{planText}</Info>
              <Info label="Plan source">
                {user.plan === "pro"
                  ? user.plan_source === "manual"
                    ? `Granted by ${user.granted_by_email || "admin"}`
                    : user.plan_source || "—"
                  : "—"}
              </Info>
              <Info label="Watchlist items">{user.watchlist_count}</Info>
              <Info label="Active sessions">{user.active_sessions}</Info>
              <Info label="Failed logins">
                {user.failed_logins}
                {user.locked && " (locked)"}
              </Info>
              <Info label="Default store">{user.settings.default_store}</Info>
            </div>
          </section>

          <section className="content-card admin-section">
            <div className="card-heading">
              <div>
                <h2>Recent activity</h2>
                <p>Security events for this account</p>
              </div>
            </div>

            {activity.length === 0 ? (
              <div className="empty-state">No recorded activity yet.</div>
            ) : (
              <ul className="activity-list">
                {activity.map((item) => (
                  <li key={item.id}>
                    <div>
                      <strong>{item.action.replace(/_/g, " ")}</strong>
                      {describeDetails(item.details) && (
                        <small>{describeDetails(item.details)}</small>
                      )}
                    </div>

                    <span>{formatDateTime(item.created_at)}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <div className="admin-detail-side">
          <section className="content-card">
            <div className="card-heading">
              <div>
                <h2>Plan</h2>
                <p>Currently: {planText}</p>
              </div>
            </div>

            <div className="admin-actions">
              <select
                className="input"
                value={grant}
                onChange={(event) => setGrant(event.target.value)}
                aria-label="Pro duration"
              >
                <option value="30">30 days</option>
                <option value="90">90 days</option>
                <option value="365">365 days</option>
                <option value="lifetime">Lifetime</option>
              </select>

              <button
                type="button"
                className="primary-button"
                disabled={busy !== ""}
                onClick={() =>
                  run(
                    "grant",
                    () =>
                      setUserPlan(
                        user.id,
                        grant === "lifetime"
                          ? { plan: "pro", lifetime: true }
                          : { plan: "pro", days: Number(grant) }
                      )
                  )
                }
              >
                Grant Pro
              </button>

              {user.plan === "pro" && (
                <button
                  type="button"
                  className="secondary-button"
                  disabled={busy !== ""}
                  onClick={() =>
                    run(
                      "revoke",
                      () => setUserPlan(user.id, { plan: "free" }),
                      "Revoke Pro for this user?"
                    )
                  }
                >
                  Revoke Pro
                </button>
              )}
            </div>
          </section>

          <section className="content-card admin-section">
            <div className="card-heading">
              <div>
                <h2>Account</h2>
                <p>Support actions</p>
              </div>
            </div>

            <div className="admin-actions">
              {!user.email_verified && (
                <button
                  type="button"
                  className="secondary-button"
                  disabled={busy !== ""}
                  onClick={() => run("verify", () => verifyUserEmail(user.id))}
                >
                  Mark email verified
                </button>
              )}

              {(user.locked || user.failed_logins > 0) && (
                <button
                  type="button"
                  className="secondary-button"
                  disabled={busy !== ""}
                  onClick={() => run("unlock", () => unlockUser(user.id))}
                >
                  Clear login lock
                </button>
              )}

              {!isSelf && user.active_sessions > 0 && (
                <button
                  type="button"
                  className="secondary-button"
                  disabled={busy !== ""}
                  onClick={() =>
                    run(
                      "logout",
                      () => forceLogoutUser(user.id),
                      "Log this user out everywhere?"
                    )
                  }
                >
                  Log out everywhere
                </button>
              )}

              {!protectedAccount && user.status === "active" && (
                <button
                  type="button"
                  className="danger-button"
                  disabled={busy !== ""}
                  onClick={() =>
                    run(
                      "suspend",
                      () => suspendUser(user.id),
                      "Suspend this account? They will be logged out and blocked."
                    )
                  }
                >
                  Suspend account
                </button>
              )}

              {!protectedAccount && user.status === "suspended" && (
                <button
                  type="button"
                  className="secondary-button"
                  disabled={busy !== ""}
                  onClick={() => run("unsuspend", () => unsuspendUser(user.id))}
                >
                  Reactivate account
                </button>
              )}
            </div>

            {protectedAccount && (
              <p className="twofa-text admin-note">
                {isSelf
                  ? "This is your own account. Suspend and delete are disabled."
                  : "Admin accounts can't be suspended or deleted here. Roles are changed in the database."}
              </p>
            )}
          </section>

          {!protectedAccount && (
            <section className="content-card admin-section danger-zone">
              <div className="card-heading">
                <div>
                  <h2>Delete account</h2>
                  <p>
                    Permanently removes this user, their watchlist and sessions.
                    This cannot be undone.
                  </p>
                </div>
              </div>

              <form onSubmit={handleDelete}>
                <label className="form-field">
                  <span>Type {user.email} to confirm</span>
                  <input
                    className="input"
                    value={confirmEmail}
                    onChange={(event) => setConfirmEmail(event.target.value)}
                    autoComplete="off"
                  />
                </label>

                <button
                  type="submit"
                  className="danger-button"
                  disabled={
                    busy !== "" ||
                    confirmEmail.trim().toLowerCase() !== user.email.toLowerCase()
                  }
                >
                  Delete permanently
                </button>
              </form>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminUserDetail;