import React from "react";
import ReactDOM from "react-dom/client";
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/500.css";
import "@fontsource/poppins/600.css";
import "@fontsource/poppins/700.css";
import "./index.css";
import "./theme-dark.css";
import "./responsive.css";
import "./admin.css";
import "./pro.css";
import App from "./App";
import ComingSoon from "./pages/ComingSoon";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";

// Before launch the public site shows only the coming-soon page, without the
// login machinery, so it never contacts the API
const COMING_SOON = import.meta.env.VITE_COMING_SOON === "true";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {COMING_SOON ? (
      <ComingSoon />
    ) : (
      <ThemeProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ThemeProvider>
    )}
  </React.StrictMode>
);