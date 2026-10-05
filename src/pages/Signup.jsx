import { useState } from "react";
import { Link } from "react-router-dom";

import AuthLayout from "../components/auth/AuthLayout";
import {
  FormField,
  PasswordField,
  PasswordRules,
} from "../components/auth/FormFields";
import { signup } from "../services/api";
import {
  getPasswordRules,
  isPasswordValid,
  validateEmail,
  validateName,
} from "../utils/validation";

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    setFormError("");

    const nextErrors = {};

    const nameError = validateName(name);
    const emailError = validateEmail(email);

    if (nameError) nextErrors.name = nameError;
    if (emailError) nextErrors.email = emailError;

    if (!isPasswordValid(password, email)) {
      nextErrors.password = "Your password doesn't meet all the rules below.";
    }

    if (confirm !== password) {
      nextErrors.confirm = "Passwords don't match.";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);

    try {
      const data = await signup({
        name: name.trim(),
        email: email.trim(),
        password,
      });

      setSuccessMessage(data.message);
    } catch (error) {
      const data = error.response?.data;

      if (data?.fields) {
        setErrors(data.fields);
      }

      setFormError(
        data?.error || "Unable to create your account. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (successMessage) {
    return (
      <AuthLayout
        title="Check your email"
        subtitle={successMessage}
        footer={<Link to="/login">Back to log in</Link>}
      >
        <div className="auth-alert success">
          We sent a link to {email.trim()}. It expires in 24 hours.
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Compare prices, track deals and save more."
      footer={
        <>
          Already have an account? <Link to="/login">Log in</Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate>
        {formError && <div className="auth-alert error">{formError}</div>}

        <FormField
          label="Name"
          autoComplete="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          error={errors.name}
        />

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
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={errors.password}
        />

        <PasswordRules
          rules={getPasswordRules(password, email)}
          started={password.length > 0}
        />

        <PasswordField
          label="Confirm password"
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
          {submitting ? "Creating account..." : "Create account"}
        </button>
      </form>
    </AuthLayout>
  );
}

export default Signup;