import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import {
  getPriceTrends,
  getRatings,
  getTopDiscounts,
} from "../services/api";

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "ratings", label: "Rating Distribution" },
  { key: "discounts", label: "Top Discounts" },
  { key: "trends", label: "Price Trends" },
];

const TREND_DAYS = 30;
const DISCOUNT_LIMIT = 20;

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

function RatingChart({ data }) {
  return (
    <div className="chart-container">
      <ResponsiveContainer
        width="100%"
        height="100%"
      >
        <BarChart data={data}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#E2E8F0"
          />

          <XAxis dataKey="rating" />

          <YAxis allowDecimals={false} />

          <Tooltip />

          <Bar
            dataKey="count"
            fill="#5C3AED"
            radius={[6, 6, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function DiscountList({ items }) {
  if (items.length === 0) {
    return (
      <div className="empty-state">
        No discounted products yet.
      </div>
    );
  }

  return (
    <div className="discount-list">
      {items.map((product) => (
        <Link
          className="discount-item discount-item-link"
          key={product.id}
          to={`/products/${product.id}`}
        >
          <div className="discount-product">
            <div className="mini-thumbnail">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt=""
                />
              ) : (
                "PP"
              )}
            </div>

            <span>
              {product.product_name}
            </span>
          </div>

          <strong>
            {product.discount_percent ?? 0}%
          </strong>
        </Link>
      ))}
    </div>
  );
}

function Analytics() {
  const [searchParams, setSearchParams] = useSearchParams();

  const requestedTab = searchParams.get("tab");
  const activeTab = TABS.some((tab) => tab.key === requestedTab)
    ? requestedTab
    : "overview";

  const [ratings, setRatings] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [trendPoints, setTrendPoints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      const [ratingsRes, discountsRes, trendsRes] =
        await Promise.allSettled([
          getRatings(),
          getTopDiscounts(DISCOUNT_LIMIT),
          getPriceTrends(TREND_DAYS),
        ]);

      if (ratingsRes.status === "fulfilled") {
        setRatings(ratingsRes.value.ratings || []);
      } else {
        console.error("Ratings loading failed:", ratingsRes.reason);
      }

      if (discountsRes.status === "fulfilled") {
        setDiscounts(discountsRes.value.products || []);
      } else {
        console.error("Discounts loading failed:", discountsRes.reason);
      }

      if (trendsRes.status === "fulfilled") {
        setTrendPoints(trendsRes.value.trends || []);
      } else {
        console.error("Price trends loading failed:", trendsRes.reason);
      }

      setLoading(false);
    }

    loadAnalytics();
  }, []);

  function handleTabChange(key) {
    setSearchParams(key === "overview" ? {} : { tab: key });
  }

  const distribution = [1, 2, 3, 4, 5].map(
    (rating) => ({
      rating: String(rating),
      count: ratings.filter(
        (item) =>
          Math.round(Number(item.rating)) ===
          rating
      ).length,
    })
  );

  const trendSeries = buildTrendSeries(trendPoints, TREND_DAYS);
  const hasTrendData = trendSeries.some((point) => point.change !== null);

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <h1>Analytics</h1>
          <p>
            Understand product ratings and discounts.
          </p>
        </div>
      </div>

      <div className="analytics-tabs" role="tablist">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.key}
            className={`analytics-tab ${
              activeTab === tab.key ? "active" : ""
            }`}
            onClick={() => handleTabChange(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-state">
          Loading analytics...
        </div>
      ) : activeTab === "overview" ? (
        <div className="analytics-grid">
          <div className="content-card chart-card">
            <div className="card-heading">
              <div>
                <h2>Rating Distribution</h2>
                <p>
                  Number of products by rating
                </p>
              </div>
            </div>

            <RatingChart data={distribution} />
          </div>

          <div className="content-card">
            <div className="card-heading">
              <div>
                <h2>Top 5 Discounted Products</h2>
                <p>
                  Products with the highest discounts
                </p>
              </div>
            </div>

            <DiscountList items={discounts.slice(0, 5)} />
          </div>
        </div>
      ) : activeTab === "ratings" ? (
        <div className="content-card chart-card">
          <div className="card-heading">
            <div>
              <h2>Rating Distribution</h2>
              <p>
                Number of products by rating
              </p>
            </div>
          </div>

          <RatingChart data={distribution} />
        </div>
      ) : activeTab === "discounts" ? (
        <div className="content-card">
          <div className="card-heading">
            <div>
              <h2>Top Discounted Products</h2>
              <p>
                Products with the highest discounts
              </p>
            </div>
          </div>

          <DiscountList items={discounts} />
        </div>
      ) : (
        <div className="content-card chart-card">
          <div className="card-heading">
            <div>
              <h2>Price Trends</h2>
              <p>
                Average price change per day, last {TREND_DAYS} days
              </p>
            </div>
          </div>

          {hasTrendData ? (
            <div className="chart-container">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <LineChart
                  data={trendSeries}
                  margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#E2E8F0"
                  />

                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11 }}
                    interval="preserveStartEnd"
                    minTickGap={24}
                  />

                  <YAxis
                    tick={{ fontSize: 11 }}
                    width={48}
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
      )}
    </div>
  );
}

export default Analytics;