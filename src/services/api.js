import axios from "axios";
// Save a Paystack return reference immediately, before any redirect drops it
try {
  const returnParams = new URLSearchParams(window.location.search);
  const returnRef = returnParams.get("reference") || returnParams.get("trxref");

  if (returnRef && returnRef.startsWith("pp_")) {
    sessionStorage.setItem("pp_pending_ref", returnRef);
    window.history.replaceState({}, "", window.location.pathname);
  }
} catch {
  // storage unavailable
}

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL ||
    "http://localhost:5000/api",
  timeout: 30000,
  withCredentials: true,
});

// CSRF token lives in memory only (never in storage)
let csrfToken = "";

export function setCsrfToken(token) {
  csrfToken = token || "";
}

api.interceptors.request.use((config) => {
  const method = (config.method || "get").toLowerCase();

  if (!["get", "head", "options"].includes(method) && csrfToken) {
    config.headers["X-CSRF-Token"] = csrfToken;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || "";

    if (error.response?.status === 401 && !url.startsWith("/auth/")) {
      window.dispatchEvent(new Event("pricepounce:unauthorized"));
    }

    return Promise.reject(error);
  }
);

/* ---------- products and analytics ---------- */

export async function getProducts() {
  const response = await api.get("/products");
  return response.data;
}

export async function getProductsPage({
  page = 1,
  perPage = 10,
  sort = "updated",
  order = "desc",
  q = "",
  store = "",
  category = "",
  brand = "",
} = {}) {
  const response = await api.get("/products", {
    params: {
      page,
      per_page: perPage,
      sort,
      order,
      q: q || undefined,
      store: store || undefined,
      category: category || undefined,
      brand: brand || undefined,
    },
  });

  return response.data;
}

export async function getCategories() {
  const response = await api.get("/categories");
  return response.data;
}

export async function getBrands(category = "") {
  const response = await api.get("/brands", {
    params: { category: category || undefined },
  });

  return response.data;
}

export async function searchProducts(query) {
  const response = await api.get("/products/search", {
    params: { q: query },
  });

  return response.data;
}

export async function getProduct(productId) {
  const response = await api.get(`/products/${productId}`);
  return response.data;
}

export async function getPriceHistory(productId) {
  const response = await api.get(
    `/products/${productId}/history`
  );

  return response.data;
}

export async function getAnalyticsSummary() {
  const response = await api.get("/analytics/summary");
  return response.data;
}

export async function getTopDiscounts(limit = 5) {
  const response = await api.get("/analytics/top-discounts", {
    params: { limit },
  });

  return response.data;
}

export async function getRatings() {
  const response = await api.get("/analytics/ratings");
  return response.data;
}

export async function getStoreProducts(store) {
  const response = await api.get(
    `/analytics/stores/${encodeURIComponent(store)}`
  );

  return response.data;
}

export async function getPriceDrops(limit = 20) {
  const response = await api.get("/analytics/price-drops", {
    params: { limit },
  });

  return response.data;
}

export async function getStoreSummaries() {
  const response = await api.get("/analytics/stores");
  return response.data;
}

export async function getLastUpdate() {
  const response = await api.get("/analytics/last-update");
  return response.data;
}

export async function getPriceTrends(days = 7) {
  const response = await api.get("/analytics/price-trends", {
    params: { days },
  });

  return response.data;
}

/* ---------- watchlist ---------- */

export async function getWatchlist() {
  const response = await api.get("/watchlist");
  return response.data;
}

export async function getWatchlistIds() {
  const response = await api.get("/watchlist/ids");
  return response.data;
}

export async function addToWatchlist(productId) {
  const response = await api.post(`/watchlist/${productId}`);
  return response.data;
}

export async function removeFromWatchlist(productId) {
  const response = await api.delete(`/watchlist/${productId}`);
  return response.data;
}

/* ---------- authentication ---------- */

export async function signup(payload) {
  const response = await api.post("/auth/signup", payload);
  return response.data;
}

export async function login(email, password) {
  const response = await api.post("/auth/login", { email, password });
  return response.data;
}

export async function logout() {
  const response = await api.post("/auth/logout");
  return response.data;
}

export async function getMe() {
  const response = await api.get("/auth/me");
  return response.data;
}

export async function verifyEmail(token) {
  const response = await api.post("/auth/verify-email", { token });
  return response.data;
}

export async function resendVerification(email) {
  const response = await api.post("/auth/resend-verification", { email });
  return response.data;
}

export async function forgotPassword(email) {
  const response = await api.post("/auth/forgot-password", { email });
  return response.data;
}

export async function resetPassword(token, password) {
  const response = await api.post("/auth/reset-password", {
    token,
    password,
  });

  return response.data;
}

/* ---------- account ---------- */

export async function updateProfile(name) {
  const response = await api.patch("/account/profile", { name });
  return response.data;
}

export async function updateSettings(settings) {
  const response = await api.patch("/account/settings", settings);
  return response.data;
}

export async function changePassword(currentPassword, newPassword) {
  const response = await api.post("/account/change-password", {
    current_password: currentPassword,
    new_password: newPassword,
  });

  return response.data;
}

export async function setTargetPrice(productId, targetPrice) {
  const response = await api.put(`/watchlist/${productId}/target`, {
    target_price: targetPrice,
  });

  return response.data;
}

export async function getProductInsights(productId) {
  const response = await api.get(`/products/${productId}/insights`);
  return response.data;
}

export async function downloadWatchlistCsv() {
  const response = await api.get("/watchlist/export.csv", {
    responseType: "blob",
  });

  return response.data;
}

export async function createCheckout(interval) {
  const response = await api.post("/billing/checkout", { interval });
  return response.data;
}

export async function verifyPayment(reference) {
  const response = await api.get("/billing/verify", { params: { reference } });
  return response.data;
}

export async function getBillingStatus() {
  const response = await api.get("/billing/status");
  return response.data;
}

export async function cancelSubscription() {
  const response = await api.post("/billing/cancel");
  return response.data;
}

export async function downloadAccountData() {
  const response = await api.get("/account/export", { responseType: "blob" });
  return response.data;
}

export async function downloadAccountPdf() {
  const response = await api.get("/account/export.pdf", { responseType: "blob" });
  return response.data;
}

export default api;