import { useState } from "react";
import { Link } from "react-router-dom";

import AuthLayout from "../components/auth/AuthLayout";
import { FormField, PasswordField } from "../components/auth/FormFields";
import { useAuth } from "../context/AuthContext";
import { resendVerification } from "../services/api";
import { validateEmail } from "../utils/validation";

function Login() {
  const { login, completeTwoFactorLogin } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [info, setInfo] = useState("");
  const [notVerified, setNotVerified] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Second step (two-factor authentication)
  const [mfaToken, setMfaToken] = useState("");
  const [code, setCode] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    setFormError("");
    setInfo("");
    setNotVerified(false);

    const nextErrors = {};
    const emailError = validateEmail(email);

    if (emailError) nextErrors.email = emailError;
    if (!password) nextErrors.password = "Password is required.";

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);

    try {
      const result = await login(email.trim(), password);

      if (result.mfaRequired) {
        setMfaToken(result.mfaToken);
        setPassword("");
        setSubmitting(false);
      }
      // Otherwise the route guard redirects automatically
    } catch (error) {
      const data = error.response?.data;

      if (data?.code === "email_not_verified") {
        setNotVerified(true);
      }

      setFormError(data?.error || "Unable to log in. Please try again.");
      setSubmitting(false);
    }
  }

  async function handleCodeSubmit(event) {
    event.preventDefault();

    setFormError("");

    if (!code.trim()) {
      setErrors({ code: "Enter your authentication code." });
      return;
    }

    setErrors({});
    setSubmitting(true);

    try {
      await completeTwoFactorLogin(mfaToken, code.trim());
    } catch (error) {
      const data = error.response?.data;

      if (data?.code === "mfa_expired") {
        setMfaToken("");
        setCode("");
      }

      setFormError(data?.error || "Unable to verify the code.");
      setSubmitting(false);
    }
  }

  async function handleResend() {
    try {
      const data = await resendVerification(email.trim());
      setInfo(data.message);
    } catch (error) {
      setFormError(
        error.response?.data?.error || "Unable to send the email right now."
      );
    }
  }

  if (mfaToken) {
    return (
      <AuthLayout
        title="Two-step verification"
        subtitle="Enter the 6-digit code from your authenticator app, or one of your recovery codes."
        footer={
          <button
            type="button"
            className="link-button"
            onClick={() => {
              setMfaToken("");
              setCode("");
              setFormError("");
            }}
          >
            Back to log in
          </button>
        }
      >
        <form onSubmit={handleCodeSubmit} noValidate>
          {formError && <div className="auth-alert error">{formError}</div>}

          <FormField
            label="Authentication code"
            autoComplete="one-time-code"
            inputMode="text"
            autoFocus
            value={code}
            onChange={(event) => setCode(event.target.value)}
            error={errors.code}
          />

          <button
            type="submit"
            className="primary-button auth-submit"
            disabled={submitting}
          >
            {submitting ? "Verifying..." : "Verify and log in"}
          </button>
        </form>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to track prices and save more."
      footer={
        <>
          New to PricePounce? <Link to="/signup">Create an account</Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate>
        {formError && <div className="auth-alert error">{formError}</div>}
        {info && <div className="auth-alert success">{info}</div>}

        {notVerified && (
          <button
            type="button"
            className="link-button"
            onClick={handleResend}
          >
            Resend verification email
          </button>
        )}

        <FormField
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={errors.email}
        />

        <PasswordField
          label="Password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={errors.password}
        />

        <div className="auth-row">
          <Link to="/forgot-password">Forgot password?</Link>
        </div>

        <button
          type="submit"
          className="primary-button auth-submit"
          disabled={submitting}
        >
          {submitting ? "Logging in..." : "Log in"}
        </button>
      </form>
    </AuthLayout>
  );
}

export default Login;