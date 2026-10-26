import { useSearchParams } from "react-router-dom";

import AdminAudit from "./AdminAudit";
import AdminOverview from "./AdminOverview";
import AdminUsers from "./AdminUsers";
import AdminCommunity from "./AdminCommunity";

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "users", label: "Users" },
  { key: "audit", label: "Audit log" },
  { key: "community", label: "Community" },
];

function Admin() {
  const [searchParams, setSearchParams] = useSearchParams();

  const requested = searchParams.get("tab");
  const active = TABS.some((tab) => tab.key === requested)
    ? requested
    : "overview";

  function handleTab(key) {
    setSearchParams(key === "overview" ? {} : { tab: key });
  }

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <h1>Admin</h1>
          <p>Manage users, plans and security.</p>
        </div>
      </div>

      <div className="analytics-tabs" role="tablist">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={active === tab.key}
            className={`analytics-tab ${active === tab.key ? "active" : ""}`}
            onClick={() => handleTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {active === "overview" && <AdminOverview />}
      {active === "users" && <AdminUsers />}
      {active === "community" && <AdminCommunity />}
      {active === "audit" && <AdminAudit />}
    </div>
  );
}

export default Admin;