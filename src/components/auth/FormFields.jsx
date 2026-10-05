import { Check, Eye, EyeOff } from "lucide-react";
import { useId, useState } from "react";

export function FormField({ label, error, ...inputProps }) {
  const id = useId();

  return (
    <div className="form-field">
      <label htmlFor={id}>{label}</label>

      <input
        id={id}
        className={`input ${error ? "input-error" : ""}`}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        {...inputProps}
      />

      {error && (
        <span className="field-error" id={`${id}-error`} role="alert">
          {error}
        </span>
      )}
    </div>
  );
}

export function PasswordField({ label, error, ...inputProps }) {
  const id = useId();
  const [visible, setVisible] = useState(false);

  return (
    <div className="form-field">
      <label htmlFor={id}>{label}</label>

      <div className="password-wrap">
        <input
          id={id}
          className={`input ${error ? "input-error" : ""}`}
          type={visible ? "text" : "password"}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          {...inputProps}
        />

        <button
          type="button"
          className="password-toggle"
          onClick={() => setVisible((value) => !value)}
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>

      {error && (
        <span className="field-error" id={`${id}-error`} role="alert">
          {error}
        </span>
      )}
    </div>
  );
}

export function PasswordRules({ rules, started }) {
  return (
    <ul className="password-rules">
      {rules.map((rule) => (
        <li
          key={rule.id}
          className={started ? (rule.ok ? "ok" : "bad") : ""}
        >
          <Check size={13} />
          {rule.label}
        </li>
      ))}
    </ul>
  );
}