import { Activity, Ban, Crown, ShieldCheck, Users } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import StatCard from "../../components/ui/StatCard";
import { getAdminStats } from "../../services/adminApi";
import { formatDateTime } from "../../utils/dates";

function buildSeries(points) {
  const byDay = new Map(points.map((point) => [point.day, point.signups]));
  const today = new Date();
  const series = [];

  for (let i = 29; i >= 0; i -= 1) {
    const date = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() - i
    );

    const key = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

    series.push({
      label: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      signups: byDay.get(key) || 0,
    });
  }

  return series;
}

function AdminOverview() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setStats(await getAdminStats());
      } catch (requestError) {
        console.error("Admin stats failed:", requestError);
        setError(
          requestError.response?.data?.error ||
            "Unable to load the admin overview."
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) {
    return <div className="loading-state">Loading overview...</div>;
  }

  if (error || !stats) {
    return (
      <div className="content-card">
        <div className="empty-state">{error}</div>
      </div>
    );
  }

  const { users, content, security } = stats;
  const series = buildSeries(stats.signups);

  return (
    <>
      <section className="stats-grid">
        <StatCard
          title="Total Users"
          value={users.total_users.toLocaleString()}
          subtitle={`${users.verified_users} verified`}
          icon={<Users size={19} />}
          accent="blue"
        />

        <StatCard
          title="Pro Users"
          value={users.pro_users.toLocaleString()}
          subtitle="Active Pro plans"
          icon={<Crown size={19} />}
          accent="purple"
        />

        <StatCard
          title="Active (7 days)"
          value={users.active_7d.toLocaleString()}
          subtitle="Logged in this week"
          icon={<Activity size={19} />}
          accent="green"
        />

        <StatCard
          title="New Signups (7 days)"
          value={users.signups_7d.toLocaleString()}
          subtitle={`${users.signups_30d} in 30 days`}
          icon={<Users size={19} />}
          accent="orange"
        />
      </section>

      <section className="stats-grid">
        <StatCard
          title="2FA Enabled"
          value={users.mfa_users.toLocaleString()}
          subtitle={`${users.admins} admin account(s)`}
          icon={<ShieldCheck size={19} />}
          accent="green"
        />

        <StatCard
          title="Suspended"
          value={users.suspended_users.toLocaleString()}
          subtitle="Blocked accounts"
          icon={<Ban size={19} />}
          accent="orange"
        />

        <StatCard
          title="Failed Logins (24h)"
          value={security.failed_logins_24h.toLocaleString()}
          subtitle="Wrong password or code"
          icon={<ShieldCheck size={19} />}
          accent="purple"
        />

        <StatCard
          title="Watchlist Entries"
          value={content.entries.toLocaleString()}
          subtitle={`${content.watchers} user(s) following`}
          icon={<Activity size={19} />}
          accent="blue"
        />
      </section>

      <div className="content-card admin-section">
        <div className="card-heading">
          <div>
            <h2>Signups</h2>
            <p>New accounts per day, last 30 days</p>
          </div>
        </div>

        <div className="chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={series}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />

              <XAxis
                dataKey="label"
                tick={{ fontSize: 10 }}
                interval="preserveStartEnd"
                minTickGap={24}
              />

              <YAxis allowDecimals={false} />

              <Tooltip />

              <Bar
                dataKey="signups"
                fill="#5C3AED"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="content-card admin-section">
        <div className="card-heading">
          <div>
            <h2>Scraper &amp; Data Health</h2>
            <p>
              {content.history_rows.toLocaleString()} price records stored
            </p>
          </div>
        </div>

        <div className="admin-table-wrap">
          <div className="admin-table admin-table-small">
            <div className="admin-row admin-row-3 head">
              <span>Store</span>
              <span>Products</span>
              <span>Last updated</span>
            </div>

            {stats.stores.length === 0 ? (
              <div className="empty-state">No products yet.</div>
            ) : (
              stats.stores.map((store) => (
                <div
                  className="admin-row admin-row-3"
                  key={store.store_name}
                >
                  <strong>{store.store_name}</strong>
                  <span>{store.products}</span>
                  <span>{formatDateTime(store.last_checked)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default AdminOverview;