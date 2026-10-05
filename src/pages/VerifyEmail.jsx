import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import AuthLayout from "../components/auth/AuthLayout";
import { verifyEmail } from "../services/api";

function VerifyEmail() {
  const location = useLocation();
  const navigate = useNavigate();

  const [token] = useState(
    () => new URLSearchParams(window.location.search).get("token") || ""
  );

  const [status, setStatus] = useState(token ? "loading" : "error");
  const [message, setMessage] = useState(
    token ? "" : "This verification link is missing or invalid."
  );

  const started = useRef(false);

  useEffect(() => {
    if (!token || started.current) return;

    started.current = true;

    // Remove the token from the address bar
    navigate(location.pathname, { replace: true });

    verifyEmail(token)
      .then((data) => {
        setMessage(data.message);
        setStatus("success");
      })
      .catch((error) => {
        setMessage(
          error.response?.data?.error ||
            "We couldn't verify your email. Please try again."
        );
        setStatus("error");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthLayout
      title={
        status === "loading"
          ? "Verifying your email..."
          : status === "success"
          ? "Email verified"
          : "Verification failed"
      }
      footer={<Link to="/login">Go to log in</Link>}
    >
      {message && (
        <div
          className={`auth-alert ${status === "success" ? "success" : "error"}`}
        >
          {message}
        </div>
      )}
    </AuthLayout>
  );
}

export default VerifyEmail;