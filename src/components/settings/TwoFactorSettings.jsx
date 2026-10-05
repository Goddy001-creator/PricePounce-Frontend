import { Copy } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";

import { FormField, PasswordField } from "../auth/FormFields";
import { useAuth } from "../../context/AuthContext";
import {
  disableTwoFactor,
  enableTwoFactor,
  regenerateRecoveryCodes,
  setupTwoFactor,
} from "../../services/authApi";

function TwoFactorSettings() {
  const { user, applyUser } = useAuth();

  // idle | setup | codes | disable | regenerate
  const [mode, setMode] = useState("idle");
  const [setup, setSetup] = useState(null);
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [codes, setCodes] = useState([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const isAdmin = user.role === "admin";

  function reset(nextMode = "idle") {
    setMode(nextMode);
    setCode("");
    setPassword("");
    setError("");
  }

  function messageFrom(requestError, fallback) {
    return requestError.response?.data?.error || fallback;
  }

  async function startSetup() {
    setBusy(true);
    setError("");

    try {
      const data = await setupTwoFactor();
      setSetup(data);
      setMode("setup");
    } catch (requestError) {
      setError(messageFrom(requestError, "Couldn't start the setup."));
    } finally {
      setBusy(false);
    }
  }

  async function confirmEnable(event) {
    event.preventDefault();
    setBusy(true);
    setError("");

    try {
      const data = await enableTwoFactor(code);
      applyUser(data.user);
      setCodes(data.recovery_codes);
      setSetup(null);
      setMode("codes");
      setCode("");
    } catch (requestError) {
      setError(messageFrom(requestError, "That code is not correct."));
    } finally {
      setBusy(false);
    }
  }

  async function confirmDisable(event) {
    event.preventDefault();
    setBusy(true);
    setError("");

    try {
      const data = await disableTwoFactor(password, code);
      applyUser(data.user);
      reset();
    } catch (requestError) {
      setError(messageFrom(requestError, "Couldn't turn off two-factor."));
    } finally {
      setBusy(false);
    }
  }

  async function confirmRegenerate(event) {
    event.preventDefault();
    setBusy(true);
    setError("");

    try {
      const data = await regenerateRecoveryCodes(code);
      setCodes(data.recovery_codes);
      setMode("codes");
      setCode("");
    } catch (requestError) {
      setError(messageFrom(requestError, "That code is not correct."));
    } finally {
      setBusy(false);
    }
  }

  async function copyCodes() {
    try {
      await navigator.clipboard.writeText(codes.join("\n"));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Couldn't copy. Please write the codes down instead.");
    }
  }

  return (
    <div className="twofa-box">
      <h3>Two-factor authentication</h3>

      {mode === "idle" && !user.totp_enabled && (
        <>
          <p className="twofa-text">
            Add a second step to your login with an authenticator app such as
            Google Authenticator or Authy.
            {isAdmin && " Admin access requires it."}
          </p>

          {error && <div className="auth-alert error">{error}</div>}

          <button
            type="button"
            className="secondary-button"
            onClick={startSetup}
            disabled={busy}
          >
            Turn on two-factor
          </button>
        </>
      )}

      {mode === "setup" && setup && (
        <form onSubmit={confirmEnable} noValidate>
          <p className="twofa-text">
            1. Scan this QR code with your authenticator app, or type the key
            by hand.
          </p>

          <div className="qr-box">
            <QRCodeSVG value={setup.otpauth_uri} size={160} />
          </div>

          <p className="secret-text">{setup.secret}</p>

          <p className="twofa-text">
            2. Enter the 6-digit code the app shows.
          </p>

          {error && <div className="auth-alert error">{error}</div>}

          <FormField
            label="6-digit code"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={code}
            onChange={(event) => setCode(event.target.value)}
          />

          <div className="twofa-actions">
            <button type="submit" className="secondary-button" disabled={busy}>
              {busy ? "Checking..." : "Turn on"}
            </button>

            <button
              type="button"
              className="link-button"
              onClick={() => reset()}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {mode === "codes" && (
        <>
          <div className="auth-alert success">
            Two-factor authentication is on. Save these recovery codes now. You
            will not see them again.
          </div>

          <ul className="recovery-codes">
            {codes.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          {error && <div className="auth-alert error">{error}</div>}

          <div className="twofa-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={copyCodes}
            >
              <Copy size={16} />
              {copied ? "Copied" : "Copy codes"}
            </button>

            <button
              type="button"
              className="secondary-button"
              onClick={() => {
                setCodes([]);
                reset();
              }}
            >
              I've saved them
            </button>
          </div>
        </>
      )}

      {mode === "idle" && user.totp_enabled && (
        <>
          <p className="twofa-text">
            <span className="verified-badge">On</span> Your account asks for a
            code from your authenticator app when you log in.
            {isAdmin && " This is required for admin accounts."}
          </p>

          <div className="twofa-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={() => reset("regenerate")}
            >
              New recovery codes
            </button>

            {!isAdmin && (
              <button
                type="button"
                className="secondary-button"
                onClick={() => reset("disable")}
              >
                Turn off
              </button>
            )}
          </div>
        </>
      )}

      {mode === "regenerate" && (
        <form onSubmit={confirmRegenerate} noValidate>
          <p className="twofa-text">
            Enter a code from your authenticator app to create new recovery
            codes. The old ones will stop working.
          </p>

          {error && <div className="auth-alert error">{error}</div>}

          <FormField
            label="Authentication code"
            autoComplete="one-time-code"
            value={code}
            onChange={(event) => setCode(event.target.value)}
          />

          <div className="twofa-actions">
            <button type="submit" className="secondary-button" disabled={busy}>
              Create new codes
            </button>

            <button
              type="button"
              className="link-button"
              onClick={() => reset()}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {mode === "disable" && (
        <form onSubmit={confirmDisable} noValidate>
          <p className="twofa-text">
            Confirm with your password and a code to turn two-factor off.
          </p>

          {error && <div className="auth-alert error">{error}</div>}

          <PasswordField
            label="Password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />

          <FormField
            label="Authentication code"
            autoComplete="one-time-code"
            value={code}
            onChange={(event) => setCode(event.target.value)}
          />

          <div className="twofa-actions">
            <button type="submit" className="secondary-button" disabled={busy}>
              Turn off
            </button>

            <button
              type="button"
              className="link-button"
              onClick={() => reset()}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default TwoFactorSettings;