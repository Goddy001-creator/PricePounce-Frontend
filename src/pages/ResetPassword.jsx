import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import AuthLayout from "../components/auth/AuthLayout";
import {
  PasswordField,
  PasswordRules,
} from "../components/auth/FormFields";
import { resetPassword } from "../services/api";
import { getPasswordRules, isPasswordValid } from "../utils/validation";

function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();

  const [token] = useState(
    () => new URLSearchParams(window.location.search).get("token") || ""
  );

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Remove the token from the address bar once it's captured
  useEffect(() => {
    if (window.location.search) {
      navigate(location.pathname, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();

    setFormError("");

    const nextErrors = {};

    if (!isPasswordValid(password)) {
      nextErrors.password = "Your password doesn't meet all the rules below.";
    }

    if (confirm !== password) {
      nextErrors.confirm = "Passwords don't match.";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);

    try {
      const data = await resetPassword(token, password);
      setMessage(data.message);
    } catch (error) {
      const data = error.response?.data;

      if (data?.fields) setErrors(data.fields);

      setFormError(data?.error || "Unable to reset your password.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!token && !message) {
    return (
      <AuthLayout
        title="Link not valid"
        footer={<Link to="/forgot-password">Request a new link</Link>}
      >
        <div className="auth-alert error">
          This reset link is missing or invalid.
        </div>
      </AuthLayout>
    );
  }

  if (message) {
    return (
      <AuthLayout
        title="Password updated"
        footer={<Link to="/login">Go to log in</Link>}
      >
        <div className="auth-alert success">{message}</div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Choose a new password"
      footer={<Link to="/login">Back to log in</Link>}
    >
      <form onSubmit={handleSubmit} noValidate>
        {formError && <div className="auth-alert error">{formError}</div>}

        <PasswordField
          label="New password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={errors.password}
        />

        <PasswordRules
          rules={getPasswordRules(password)}
          started={password.length > 0}
        />

        <PasswordField
          label="Confirm new password"
          autoComplete="new-password"
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
          error={errors.confirm}
        />

        <button
          type="submit"
          className="primary-button auth-submit"
          disabled={submitting}
        >
          {submitting ? "Saving..." : "Update password"}
        </button>
      </form>
    </AuthLayout>
  );
}

export default ResetPassword;