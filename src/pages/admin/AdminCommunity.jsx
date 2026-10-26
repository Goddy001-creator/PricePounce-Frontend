import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  actOnCommunityReport,
  getCommunityReports,
} from "../../services/api";

const REASON_LABELS = {
  spam: "Spam",
  wrong_price: "Wrong price",
  abuse: "Abuse",
  scam: "Scam",
  other: "Other",
};

function AdminCommunity() {
  const [status, setStatus] = useState("open");
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ reports: [], total: 0, total_pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyKey, setBusyKey] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      setData(await getCommunityReports(status, page));
    } catch (err) {
      setError(err.response?.data?.error || "Could not load reports.");
    } finally {
      setLoading(false);
    }
  }, [status, page]);

  useEffect(() => {
    load();
  }, [load]);

  async function act(item, action) {
    const key = `${item.target_type}-${item.target_id}`;
    setBusyKey(key);

    try {
      await actOnCommunityReport(item.target_type, item.target_id, action);
      await load();
    } catch (err) {
      setError(err.response?.data?.error || "Action failed.");
    } finally {
      setBusyKey("");
    }
  }

  function switchStatus(value) {
    setStatus(value);
    setPage(1);
  }

  return (
    <div className="mod-wrap">
      <div className="segmented mod-switch">
        <button
          type="button"
          className={status === "open" ? "active" : ""}
          onClick={() => switchStatus("open")}
        >
          Needs review
        </button>
        <button
          type="button"
          className={status === "reviewed" ? "active" : ""}
          onClick={() => switchStatus("reviewed")}
        >
          Reviewed
        </button>
      </div>

      {error && <p className="mod-error">{error}</p>}
      {loading && <div className="loading-state">Loading reports...</div>}

      {!loading && data.reports.length === 0 && (
        <div className="content-card mod-empty">
          {status === "open"
            ? "Nothing to review. All clear."
            : "No reviewed reports yet."}
        </div>
      )}

      {!loading &&
        data.reports.map((item) => {
          const content = item.content;
          const key = `${item.target_type}-${item.target_id}`;
          const hidden = content?.status === "hidden";
          const removed = content?.status === "removed";
          const postId =
            item.target_type === "post" ? item.target_id : content?.post_id;

          return (
            <div className="content-card mod-card" key={key}>
              <div className="mod-top">
                <span className="mod-type">{item.target_type}</span>
                <span className="mod-count">
                  {item.report_count} report{item.report_count === 1 ? "" : "s"}
                </span>
                {item.reasons.map((reason) => (
                  <span className="mod-reason" key={reason}>
                    {REASON_LABELS[reason] || reason}
                  </span>
                ))}
                {content && (
                  <span
                    className={`mod-state ${hidden || removed ? "hidden" : "shown"}`}
                  >
                    {removed ? "Deleted by author" : hidden ? "Hidden" : "Visible"}
                  </span>
                )}
              </div>

              {content ? (
                <div className="mod-content">
                  {item.target_type === "post" ? (
                    <>
                      <strong>{content.item}</strong>
                      <div>
                        ₦{Number(content.price).toLocaleString("en-NG")} ·{" "}
                        {content.location}
                      </div>
                      {content.note && <div>{content.note}</div>}
                    </>
                  ) : (
                    <div>{content.body}</div>
                  )}

                  <div className="mod-author">
                    By {content.name} ({content.email})
                  </div>
                </div>
              ) : (
                <div className="mod-content">This was deleted.</div>
              )}

              {item.notes.length > 0 && (
                <ul className="mod-notes">
                  {item.notes.map((note, index) => (
                    <li key={index}>
                      <b>{REASON_LABELS[note.reason] || note.reason}:</b>{" "}
                      {note.details}
                    </li>
                  ))}
                </ul>
              )}

              {content && !removed && (
                <div className="mod-actions">
                  {!hidden && (
                    <button
                      type="button"
                      className="primary-button"
                      disabled={busyKey === key}
                      onClick={() => act(item, "hide")}
                    >
                      Hide
                    </button>
                  )}

                  {hidden && (
                    <button
                      type="button"
                      className="secondary-button"
                      disabled={busyKey === key}
                      onClick={() => act(item, "keep")}
                    >
                      Restore
                    </button>
                  )}

                  {!hidden && status === "open" && (
                    <button
                      type="button"
                      className="secondary-button"
                      disabled={busyKey === key}
                      onClick={() => act(item, "keep")}
                    >
                      Dismiss reports
                    </button>
                  )}

                  {hidden && status === "open" && (
                    <span className="mod-hint">
                      Auto-hidden after several reports. Restore it if it's fine.
                    </span>
                  )}

                  {postId && !hidden && (
                    <Link to={`/community/${postId}`} className="mod-view">
                      View
                    </Link>
                  )}

                  <Link to="/admin?tab=users" className="mod-view">
                    Find author in Users
                  </Link>
                </div>
              )}
            </div>
          );
        })}

      {data.total_pages > 1 && (
        <div className="mod-pager">
          <button
            type="button"
            className="secondary-button"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </button>
          <span>
            Page {page} of {data.total_pages}
          </span>
          <button
            type="button"
            className="secondary-button"
            disabled={page >= data.total_pages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default AdminCommunity;