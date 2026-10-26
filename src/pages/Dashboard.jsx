import {
  BarChart3,
  CheckCircle2,
  Package,
  Percent,
  Store,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import StatCard from "../components/ui/StatCard";
import ProductRow from "../components/ui/ProductRow";
import {
  getAnalyticsSummary,
  getLastUpdate,
  getPriceTrends,
  getProducts,
  getStoreList,
  getStoreSummaries,
  getPreviewProducts,
} from "../services/api";

const STORE_COLORS = ["#5c3aed", "#a5b4fc", "#2563eb", "#10b981"];
const TREND_DAYS = 7;

// Settings will write this key later (15, 30 or 60 minutes)
function getAutoRefreshMinutes() {
  try {
    const saved = Number(localStorage.getItem("pricepulse_auto_refresh"));
    return [15, 30, 60].includes(saved) ? saved : 30;
  } catch {
    return 30;
  }
}

function parseDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatUpdateDate(value) {
  const date = parseDate(value);
  if (!date) return "—";
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatUpdateTime(value) {
  const date = parseDate(value);
  if (!date) return "";
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function buildTrendSeries(points, days) {
  const byDay = new Map(
    points.map((point) => [point.day, Number(point.avg_change_percent)])
  );

  const today = new Date();
  const series = [];

  for (let i = days - 1; i >= 0; i -= 1) {
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
      change: byDay.has(key) ? byDay.get(key) : null,
    });
  }

  return series;
}

function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [products, setProducts] = useState([]);
  const [stores, setStores] = useState([]);
  const [storeList, setStoreList] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [trendPoints, setTrendPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const loadDashboard = useCallback(async () => {
    try {
      const [summaryData, productData] =
        await Promise.all([
          getAnalyticsSummary(),
          user ? getProducts() : getPreviewProducts(),
        ]);

      setSummary(summaryData);
      setProducts(productData.products || []);
    } catch (error) {
      console.error(
        "Dashboard loading failed:",
        error
      );
    } finally {
      setLoading(false);
    }

    const [storesRes, updateRes, trendsRes, listRes] = await Promise.allSettled([
      getStoreSummaries(),
      getLastUpdate(),
      getPriceTrends(TREND_DAYS),
      getStoreList(),
    ]);

    if (listRes.status === "fulfilled") {
      setStoreList(listRes.value.stores || []);
    } else {
      console.error("Store list loading failed:", listRes.reason);
    }

    if (storesRes.status === "fulfilled") {
      setStores(storesRes.value.stores || []);
    } else {
      console.error("Top stores loading failed:", storesRes.reason);
    }

    if (updateRes.status === "fulfilled") {
      setLastUpdate(updateRes.value?.last_checked || null);
    } else {
      console.error("Last update loading failed:", updateRes.reason);
    }

    if (trendsRes.status === "fulfilled") {
      setTrendPoints(trendsRes.value.trends || []);
    } else {
      console.error("Price trends loading failed:", trendsRes.reason);
    }
  }, [user]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  useEffect(() => {
    const timer = window.setInterval(
      loadDashboard,
      getAutoRefreshMinutes() * 60 * 1000
    );

    return () => window.clearInterval(timer);
  }, [loadDashboard]);

  const recentProducts = products.slice(0, 5);

  // Show the top 3 stores and group the rest, so the chart stays readable
  const sortedStores = [...stores].sort(
    (a, b) => Number(b.product_count) - Number(a.product_count)
  );

  const groupedStores =
    sortedStores.length <= 4
      ? sortedStores
      : [
          ...sortedStores.slice(0, 3),
          {
            store_name: "Other stores",
            product_count: sortedStores
              .slice(3)
              .reduce((sum, store) => sum + Number(store.product_count), 0),
          },
        ];

  const totalStoreProducts = groupedStores.reduce(
    (sum, store) => sum + Number(store.product_count),
    0
  );

  const donutData = groupedStores.map((store) => ({
    name: store.store_name,
    value: Number(store.product_count),
    percent: totalStoreProducts
      ? Math.round((Number(store.product_count) / totalStoreProducts) * 100)
      : 0,
  }));

  const storeNames = storeList.map((store) => store.name);
  const storeCount = storeNames.length || stores.length;
  const storeSubtitle =
    storeNames.length === 0
      ? "Online stores"
      : storeNames.length <= 3
        ? storeNames.join(", ")
        : `${storeNames.slice(0, 2).join(", ")} +${storeNames.length - 2} more`;

  const trendSeries = buildTrendSeries(trendPoints, TREND_DAYS);
  const hasTrendData = trendSeries.some((point) => point.change !== null);

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <h1>Dashboard</h1>
          <p>
            {user
              ? "Welcome back! Here's what's happening with your prices today."
              : "Live prices from Nigerian online stores. Sign up free to track products and get price alerts."}          </p>
        </div>
      </div>

      {!user && (
        <div className="guest-banner">
          <div>
            <strong>You're viewing a preview.</strong>
            <span>
              Create a free account to browse every product, see price history
              and set price alerts.
            </span>
          </div>

          <div className="gate-actions">
            <Link to="/signup" className="primary-button">
              Sign up free
            </Link>

            <Link to="/login" className="secondary-button">
              Log in
            </Link>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading-state">
          Loading dashboard...
        </div>
      ) : (
        <>
          <section className="stats-grid">
            <StatCard
              title="Total Products"
              value={summary?.total_products ?? 0}
              subtitle="Tracked products"
              trend="Live"
              icon={<Package size={19} />}
              accent="blue"
            />

            <StatCard
              title="Stores Tracked"
              value={String(storeCount)}
              subtitle={storeSubtitle}
              icon={<Store size={19} />}
              accent="purple"
            />

            <StatCard
              title="Average Discount"
              value={`${summary?.average_discount ?? 0}%`}
              subtitle="Across all products"
              icon={<Percent size={19} />}
              accent="green"
            />

            <StatCard
              title="Average Rating"
              value={summary?.average_rating ?? 0}
              subtitle="Across all products"
              icon={<BarChart3 size={19} />}
              accent="orange"
            />
          </section>

          <section className="insights-grid">
            <div className="content-card">
              <div className="card-heading">
                <div>
                  <h2>Top Stores</h2>
                  <p>Share of tracked products</p>
                </div>
              </div>

              {donutData.length > 0 ? (
                <div className="top-stores">
                  <div className="donut-wrap">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={donutData}
                          dataKey="value"
                          nameKey="name"
                          innerRadius="68%"
                          outerRadius="98%"
                          paddingAngle={2}
                          startAngle={90}
                          endAngle={-270}
                          stroke="none"
                        >
                          {donutData.map((entry, index) => (
                            <Cell
                              key={entry.name}
                              fill={STORE_COLORS[index % STORE_COLORS.length]}
                            />
                          ))}
                        </Pie>

                        <Tooltip
                          formatter={(value, name) => [
                            `${value} products`,
                            name,
                          ]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="store-legend">
                    {donutData.map((entry, index) => (
                      <div className="store-legend-item" key={entry.name}>
                        <span
                          className="store-legend-dot"
                          style={{
                            background:
                              STORE_COLORS[index % STORE_COLORS.length],
                          }}
                        />
                        <span>{entry.name}</span>
                        <strong>{entry.percent}%</strong>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="empty-state">No store data yet.</div>
              )}
            </div>

            <div className="content-card">
              <div className="card-heading">
                <div>
                  <h2>Last Update</h2>
                  <p>Database status</p>
                </div>
              </div>

              <div className="last-update-body">
                <div className="last-update-date">
                  {formatUpdateDate(lastUpdate)}
                </div>
                <div className="last-update-date">
                  {formatUpdateTime(lastUpdate)}
                </div>

                <div className="auto-refresh-status">
                  Auto refresh is ON
                  <CheckCircle2 size={15} />
                </div>
              </div>
            </div>

            <div className="content-card">
              <div className="card-heading">
                <div>
                  <h2>Price Trends</h2>
                  <p>Average price change per day</p>
                </div>
              </div>

              {hasTrendData ? (
                <div className="trend-chart">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={trendSeries}
                      margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#E2E8F0"
                      />

                      <XAxis dataKey="label" tick={{ fontSize: 10 }} />

                      <YAxis
                        tick={{ fontSize: 10 }}
                        width={42}
                        tickFormatter={(value) => `${value}%`}
                      />

                      <Tooltip
                        formatter={(value) => [
                          `${value}%`,
                          "Avg price change",
                        ]}
                      />

                      <Line
                        type="monotone"
                        dataKey="change"
                        stroke="#5C3AED"
                        strokeWidth={2.5}
                        dot={{ r: 3, fill: "#5C3AED" }}
                        activeDot={{ r: 5 }}
                        connectNulls
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="empty-state">
                  No price changes recorded in the last {TREND_DAYS} days.
                </div>
              )}
            </div>
          </section>

          <section>
            <div className="content-card">
              <div className="card-heading">
                <div>
                  <h2>Recently Added Products</h2>
                  <p>
                    Latest products from tracked stores
                  </p>
                </div>

                <a href="/products">
                  View all products →
                </a>
              </div>

              <div className="product-table">
                <div className="product-row table-heading">
                  <span>Product</span>
                  <span>Price</span>
                  <span>Original Price</span>
                  <span>Discount</span>
                  <span>Rating</span>
                </div>

                {recentProducts.length > 0 ? (
                  recentProducts.map((product) => (
                    <ProductRow
                      key={product.id}
                      product={product}
                    />
                  ))
                ) : (
                  <div className="empty-state">
                    No products found.
                  </div>
                )}
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

export default Dashboard;