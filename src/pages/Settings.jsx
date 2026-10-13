import { Database, Download, Trash2 } from "lucide-react";
import { useState } from "react";

import {
  FormField,
  PasswordField,
  PasswordRules,
} from "../components/auth/FormFields";
import TwoFactorSettings from "../components/settings/TwoFactorSettings";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import {
  changePassword,
  downloadAccountData,
  downloadAccountPdf,
} from "../services/api";
import {
  getPasswordRules,
  isPasswordValid,
  validateName,
} from "../utils/validation";

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

function Settings() {
  const { user, updateSettings, updateProfile } = useAuth();
  const { setTheme } = useTheme();

  const [feedback, setFeedback] = useState({ type: "", message: "" });

  const [name, setName] = useState(user.name);
  const [nameError, setNameError] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordMessage, setPasswordMessage] = useState("");
  const [changing, setChanging] = useState(false);
  const [dataBusy, setDataBusy] = useState(false);

  async function handleExportData(kind) {
    setDataBusy(true);
    setFeedback({ type: "", message: "" });

    try {
      const blob =
        kind === "pdf" ? await downloadAccountPdf() : await downloadAccountData();

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download =
        kind === "pdf" ? "pricepounce-statement.pdf" : "pricepounce-my-data.xlsx";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);

      setFeedback({ type: "success", message: "Your data was downloaded." });
    } catch {
      setFeedback({
        type: "error",
        message: "Couldn't export your data. Please try again.",
      });
    } finally {
      setDataBusy(false);
    }
  }

  async function handleClearCache() {
    setFeedback({ type: "", message: "" });

    try {
      sessionStorage.clear();

      if ("caches" in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((key) => caches.delete(key)));
      }
    } catch {
      // nothing to clear, or storage unavailable
    }

    setFeedback({ type: "success", message: "Cache cleared. Loading fresh data..." });
    setTimeout(() => window.location.reload(), 800);
  }

  async function saveSetting(partial) {
    setFeedback({ type: "", message: "" });

    try {
      await updateSettings(partial);
      setFeedback({ type: "success", message: "Settings saved." });
    } catch (error) {
      console.error("Saving settings failed:", error);
      setFeedback({
        type: "error",
        message: "Couldn't save your settings. Please try again.",
      });
    }
  }

  function handleThemeChange(event) {
    const next = event.target.value.toLowerCase();

    setTheme(next);
    saveSetting({ theme: next });
  }

  async function handleProfileSave(event) {
    event.preventDefault();

    const error = validateName(name);
    setNameError(error);
    setFeedback({ type: "", message: "" });

    if (error) return;

    try {
      await updateProfile(name.trim());
      setFeedback({ type: "success", message: "Profile updated." });
    } catch (requestError) {
      setNameError(
        requestError.response?.data?.fields?.name ||
        "Couldn't update your profile."
      );
    }
  }

  async function handlePasswordChange(event) {
    event.preventDefault();

    setPasswordMessage("");

    const nextErrors = {};

    if (!currentPassword) {
      nextErrors.current_password = "Enter your current password.";
    }

    if (!isPasswordValid(newPassword, user.email)) {
      nextErrors.new_password = "Your new password doesn't meet all the rules.";
    }

    if (confirmPassword !== newPassword) {
      nextErrors.confirm = "Passwords don't match.";
    }

    setPasswordErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    setChanging(true);

    try {
      const data = await changePassword(currentPassword, newPassword);

      setPasswordMessage(data.message);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      const data = error.response?.data;

      setPasswordErrors(
        data?.fields || { current_password: data?.error || "Unable to change password." }
      );
    } finally {
      setChanging(false);
    }
  }

  const planEnds = formatDate(user.plan_expires_at);

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <h1>Settings</h1>
          <p>
            Manage your PricePounce preferences.
          </p>
        </div>
      </div>

      {feedback.message && (
        <div className={`settings-feedback ${feedback.type}`}>
          {feedback.message}
        </div>
      )}

      <div className="settings-card">
        <section className="settings-section">
          <h2>General</h2>

          <div className="setting-row">
            <div className="setting-info">
              <strong>Auto Refresh</strong>
              <span>
                Automatically update product prices.
              </span>
            </div>

            <select
              value={user.settings.auto_refresh_minutes}
              onChange={(event) =>
                saveSetting({
                  auto_refresh_minutes: Number(event.target.value),
                })
              }
            >
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="60">60 minutes</option>
            </select>
          </div>

          <div className="setting-row">
            <div className="setting-info">
              <strong>Theme</strong>
              <span>
                Choose your preferred appearance.
              </span>
            </div>

            <select
              value={user.settings.theme === "dark" ? "Dark" : "Light"}
              onChange={handleThemeChange}
            >
              <option>Light</option>
              <option>Dark</option>
            </select>
          </div>

          <div className="setting-row">
            <div className="setting-info">
              <strong>Default Store</strong>
              <span>
                Select the default store filter.
              </span>
            </div>

            <select
              value={user.settings.default_store}
              onChange={(event) =>
                saveSetting({ default_store: event.target.value })
              }
            >
              <option>All Stores</option>
              <option>Jumia</option>
              <option>Konga</option>
            </select>
          </div>
        </section>

        <section className="settings-section">
          <h2>Profile</h2>

          <form className="settings-form" onSubmit={handleProfileSave} noValidate>
            <FormField
              label="Name"
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              error={nameError}
            />

            <div className="form-field">
              <label>Email</label>
              <div className="settings-email">
                {user.email}
                {user.email_verified && (
                  <span className="verified-badge">Verified</span>
                )}
              </div>
            </div>

            <div className="form-field">
              <label>Plan</label>
              <div className="settings-email">
                <span className={`plan-badge ${user.plan}`}>
                  {user.plan === "pro" ? "Pro" : "Free"}
                </span>

                {user.plan === "pro" && planEnds && (
                  <span>until {planEnds}</span>
                )}

                <span>
                  Watchlist up to {user.limits?.watchlist_max} products
                </span>
              </div>
            </div>

            <button type="submit" className="secondary-button">
              Save profile
            </button>
          </form>
        </section>

        <section className="settings-section">
          <h2>Security</h2>

          <form className="settings-form" onSubmit={handlePasswordChange} noValidate>
            {passwordMessage && (
              <div className="auth-alert success">{passwordMessage}</div>
            )}

            <PasswordField
              label="Current password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              error={passwordErrors.current_password}
            />

            <PasswordField
              label="New password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              error={passwordErrors.new_password}
            />

            <PasswordRules
              rules={getPasswordRules(newPassword, user.email)}
              started={newPassword.length > 0}
            />

            <PasswordField
              label="Confirm new password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              error={passwordErrors.confirm}
            />

            <button
              type="submit"
              className="secondary-button"
              disabled={changing}
            >
              {changing ? "Changing..." : "Change password"}
            </button>
          </form>

          <TwoFactorSettings />
        </section>

        <section className="settings-section">
          <h2>Data</h2>

          <div className="settings-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={handleClearCache}
            >
              <Trash2 size={17} />
              Clear Cache
            </button>

            <button
              type="button"
              className="secondary-button"
              onClick={() => handleExportData("pdf")}
              disabled={dataBusy}
            >
              <Download size={17} />
              {dataBusy ? "Preparing..." : "Export PDF"}
            </button>

            <button
              type="button"
              className="secondary-button"
              onClick={() => handleExportData("xlsx")}
              disabled={dataBusy}
            >
              <Download size={17} />
              Export Excel
            </button>
          </div>
        </section>

        <section className="settings-section">
          <h2>Notifications</h2>

          <div className="setting-row">
            <div className="setting-info">
              <strong>Price Drop Alerts</strong>
              <span>
                V1 notification settings placeholder.
              </span>
            </div>

            <label className="switch">
              <input type="checkbox" />
              <span />
            </label>
          </div>

          <div className="setting-row">
            <div className="setting-info">
              <strong>Email Notifications</strong>
              <span>
                Email alerts will be available later.
              </span>
            </div>

            <label className="switch">
              <input type="checkbox" />
              <span />
            </label>
          </div>
        </section>

        <section className="settings-section">
          <div className="settings-status">
            <Database size={18} />
            <span>
              PricePounce backend connection configured
            </span>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Settings;