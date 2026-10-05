import { Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import Pagination from "../../components/ui/Pagination";
import { getAdminUsers } from "../../services/adminApi";
import { formatDate, timeAgo } from "../../utils/dates";

const SORT_OPTIONS = [
  { value: "created:desc", label: "Newest first" },
  { value: "created:asc", label: "Oldest first" },
  { value: "name:asc", label: "Name A to Z" },
  { value: "last_login:desc", label: "Last login" },
];

function AdminUsers() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [plan, setPlan] = useState("");
  const [status, setStatus] = useState("");
  const [role, setRole] = useState("");
  const [sortValue, setSortValue] = useState("created:desc");
  const [page, setPage] = useState(1);

  const [data, setData] = useState({ users: [], total: 0, total_pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const requestRef = useRef(0);

  // Wait a moment after typing before searching
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);

    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    const requestId = requestRef.current + 1;
    requestRef.current = requestId;

    const [sort, order] = sortValue.split(":");

    async function load() {
      setLoading(true);
      setError("");

      try {
        const result = await getAdminUsers({
          page,
          per_page: 20,
          q: search || undefined,
          plan: plan || undefined,
          status: status || undefined,
          role: role || undefined,
          sort,
          order,
        });

        if (requestId === requestRef.current) setData(result);
      } catch (requestError) {
        if (requestId !== requestRef.current) return;

        console.error("Admin users failed:", requestError);
        setError(
          requestError.response?.data?.error || "Unable to load users."
        );
      } finally {
        if (requestId === requestRef.current) setLoading(false);
      }
    }

    load();
  }, [search, plan, status, role, sortValue, page]);

  function filterChange(setter) {
    return (event) => {
      setter(event.target.value);
      setPage(1);
    };
  }

  return (
    <div className="content-card">
      <div className="admin-toolbar">
        <div className="admin-search">
          <Search size={16} />
          <input
            className="input"
            type="text"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search name or email..."
            aria-label="Search users"
          />
        </div>

        <select className="input" value={plan} onChange={filterChange(setPlan)} aria-label="Plan">
          <option value="">All plans</option>
          <option value="free">Free</option>
          <option value="pro">Pro</option>
        </select>

        <select className="input" value={status} onChange={filterChange(setStatus)} aria-label="Status">
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>

        <select className="input" value={role} onChange={filterChange(setRole)} aria-label="Role">
          <option value="">All roles</option>
          <option value="user">Users</option>
          <option value="admin">Admins</option>
        </select>

        <select className="input" value={sortValue} onChange={filterChange(setSortValue)} aria-label="Sort">
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {error ? (
        <div className="empty-state">{error}</div>
      ) : (
        <div className="admin-table-wrap">
          <div className="admin-table">
            <div className="admin-row admin-row-users head">
              <span>User</span>
              <span>Plan</span>
              <span>Status</span>
              <span>Security</span>
              <span>Last login</span>
              <span>Joined</span>
            </div>

            {loading ? (
              <div className="loading-state">Loading users...</div>
            ) : data.users.length === 0 ? (
              <div className="empty-state">No users match these filters.</div>
            ) : (
              data.users.map((user) => (
                <Link
                  key={user.id}
                  to={`/admin/users/${user.id}`}
                  className="admin-row admin-row-users admin-row-link"
                >
                  <div className="admin-user">
                    <strong>
                      {user.name}
                      {user.role === "admin" && (
                        <span className="mini-badge admin">Admin</span>
                      )}
                    </strong>
                    <small>{user.email}</small>
                  </div>

                  <span>
                    <span className={`plan-badge ${user.plan}`}>
                      {user.plan === "pro" ? "Pro" : "Free"}
                    </span>
                  </span>

                  <span>
                    <span className={`status-badge ${user.status}`}>
                      {user.status === "active" ? "Active" : "Suspended"}
                    </span>
                  </span>

                  <span className="admin-security">
                    <span
                      className={`mini-badge ${
                        user.email_verified ? "ok" : "warn"
                      }`}
                    >
                      {user.email_verified ? "Verified" : "Unverified"}
                    </span>

                    {user.totp_enabled && (
                      <span className="mini-badge ok">2FA</span>
                    )}
                  </span>

                  <span>{timeAgo(user.last_login_at)}</span>
                  <span>{formatDate(user.created_at)}</span>
                </Link>
              ))
            )}
          </div>
        </div>
      )}

      <div className="admin-footer">
        <span className="pagination-summary">
          {data.total} user{data.total === 1 ? "" : "s"}
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

export default AdminUsers;