import { useState } from "react";
import { Link } from "react-router-dom";

import AuthLayout from "../components/auth/AuthLayout";
import { FormField } from "../components/auth/FormFields";
import { forgotPassword } from "../services/api";
import { validateEmail } from "../utils/validation";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    const emailError = validateEmail(email);
    setError(emailError);

    if (emailError) return;

    setSubmitting(true);

    try {
      const data = await forgotPassword(email.trim());
      setMessage(data.message);
    } catch (requestError) {
      setError(
        requestError.response?.data?.error ||
          "Unable to send the email right now."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      title="Forgot your password?"
      subtitle="Enter your email and we'll send you a reset link."
      footer={<Link to="/login">Back to log in</Link>}
    >
      {message ? (
        <div className="auth-alert success">{message}</div>
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          <FormField
            label="Email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            error={error}
          />

          <button
            type="submit"
            className="primary-button auth-submit"
            disabled={submitting}
          >
            {submitting ? "Sending..." : "Send reset link"}
          </button>
        </form>
      )}
    </AuthLayout>
  );
}

export default ForgotPassword;