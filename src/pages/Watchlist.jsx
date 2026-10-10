import { Bookmark, Package, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import ProductRow from "../components/ui/ProductRow";
import TargetPrice from "../components/ui/TargetPrice";
import { useWatchlist } from "../context/WatchlistContext";
import { getWatchlist } from "../services/api";

function Watchlist() {
  const { toggle } = useWatchlist();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadWatchlist = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getWatchlist();
      setProducts(data.products || []);
    } catch (requestError) {
      console.error("Watchlist loading failed:", requestError);
      setProducts([]);
      setError("Unable to load your watchlist. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWatchlist();
  }, [loadWatchlist]);

  async function handleRemove(product) {
    setProducts((previous) =>
      previous.filter((item) => item.id !== product.id)
    );

    try {
      await toggle(product.id);
    } catch {
      loadWatchlist();
    }
  }

  function handleTargetSaved(productId, target) {
    setProducts((previous) =>
      previous.map((item) =>
        item.id === productId ? { ...item, target_price: target } : item
      )
    );
  }

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <h1>Watchlist</h1>
          <p>
            Products you're following. Tap the bookmark to remove one.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={loadWatchlist}
          disabled={loading}
        >
          <RefreshCw
            size={17}
            className={loading ? "button-spinner" : ""}
          />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="content-card products-loading-card">
          <RefreshCw size={28} className="loading-icon" />
          <h3>Loading your watchlist...</h3>
          <p>Fetching the products you follow.</p>
        </div>
      ) : error ? (
        <div className="content-card products-error-card">
          <div className="products-state-icon">
            <Package size={28} />
          </div>
          <h3>Unable to load your watchlist</h3>
          <p>{error}</p>

          <button className="primary-button" onClick={loadWatchlist}>
            <RefreshCw size={17} />
            Try Again
          </button>
        </div>
      ) : products.length === 0 ? (
        <div className="content-card products-empty-card">
          <div className="products-state-icon">
            <Bookmark size={28} />
          </div>

          <h3>Your watchlist is empty</h3>

          <p>
            Open any product and tap "Add to Watchlist" to follow it here.
          </p>

          <Link to="/products" className="primary-button">
            Browse products
          </Link>
        </div>
      ) : (
        <div className="content-card products-table-card">
          <div className="products-table-heading">
            <div>
              <h2>Your Watchlist</h2>
              <p>
                {products.length} product
                {products.length === 1 ? "" : "s"} followed
              </p>
            </div>
          </div>

          <div className="products-table">
            <div className="watchlist-row watchlist-header-row">
              <div className="product-row product-row-header">
                <span>Product</span>
                <span>Current Price</span>
                <span>Original Price</span>
                <span>Discount</span>
                <span>Rating</span>
              </div>

              <span className="watchlist-spacer" />
            </div>

            <div className="product-row-list">
              {products.map((product) => (
                <div className="watchlist-item" key={product.id}>
                  <div className="watchlist-row">
                    <ProductRow product={product} />

                    <button
                      type="button"
                      className="watchlist-remove"
                      onClick={() => handleRemove(product)}
                      aria-label={`Remove ${product.product_name} from watchlist`}
                      title="Remove from watchlist"
                    >
                      <Bookmark size={16} fill="currentColor" />
                    </button>
                  </div>

                  <TargetPrice
                    product={product}
                    onSaved={handleTargetSaved}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Watchlist;