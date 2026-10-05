import { useEffect, useRef, useState } from "react";

import Pagination from "../../components/ui/Pagination";
import { getAdminAudit } from "../../services/adminApi";
import { formatDateTime } from "../../utils/dates";

function describeDetails(details) {
  if (!details) return "";

  return Object.entries(details)
    .map(([key, value]) => `${key}: ${value}`)
    .join(", ");
}

function AdminAudit() {
  const [action, setAction] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState({
    entries: [],
    actions: [],
    total: 0,
    total_pages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const requestRef = useRef(0);

  useEffect(() => {
    const requestId = requestRef.current + 1;
    requestRef.current = requestId;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const result = await getAdminAudit({
          page,
          per_page: 30,
          action: action || undefined,
        });

        if (requestId === requestRef.current) setData(result);
      } catch (requestError) {
        if (requestId !== requestRef.current) return;

        console.error("Audit log failed:", requestError);
        setError(
          requestError.response?.data?.error || "Unable to load the audit log."
        );
      } finally {
        if (requestId === requestRef.current) setLoading(false);
      }
    }

    load();
  }, [action, page]);

  return (
    <div className="content-card">
      <div className="admin-toolbar">
        <select
          className="input"
          value={action}
          onChange={(event) => {
            setAction(event.target.value);
            setPage(1);
          }}
          aria-label="Filter by action"
        >
          <option value="">All actions</option>
          {data.actions.map((item) => (
            <option key={item} value={item}>
              {item.replace(/_/g, " ")}
            </option>
          ))}
        </select>
      </div>

      {error ? (
        <div className="empty-state">{error}</div>
      ) : (
        <div className="admin-table-wrap">
          <div className="admin-table">
            <div className="admin-row admin-row-audit head">
              <span>When</span>
              <span>Action</span>
              <span>By</span>
              <span>Target</span>
              <span>IP</span>
              <span>Details</span>
            </div>

            {loading ? (
              <div className="loading-state">Loading audit log...</div>
            ) : data.entries.length === 0 ? (
              <div className="empty-state">No events recorded yet.</div>
            ) : (
              data.entries.map((entry) => (
                <div className="admin-row admin-row-audit" key={entry.id}>
                  <span>{formatDateTime(entry.created_at)}</span>
                  <strong>{entry.action.replace(/_/g, " ")}</strong>
                  <span className="admin-ellipsis">
                    {entry.actor_email || "—"}
                  </span>
                  <span className="admin-ellipsis">
                    {entry.target_email || "—"}
                  </span>
                  <span>{entry.ip || "—"}</span>
                  <span className="admin-ellipsis">
                    {describeDetails(entry.details) || "—"}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <div className="admin-footer">
        <span className="pagination-summary">
          {data.total} event{data.total === 1 ? "" : "s"}
        </span>

        <Pagination
          page={page}
          totalPages={data.total_pages}
          onPage={(next) =>
            setPage(Math.min(Math.max(1, next), data.total_pages))
          }
        />
      </div>
    </div>
  );
}

export default AdminAudit;