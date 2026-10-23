import { CheckCircle2, Package, RefreshCw, Store as StoreIcon } from "lucide-react";
import { useEffect, useState } from "react";

import NotAffiliated from "../components/ui/NotAffiliated";
import { getStoreList } from "../services/api";

function Stores() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadStores() {
    setLoading(true);

    try {
      const data = await getStoreList();
      setStores(data.stores || []);
    } catch (error) {
      console.error("Stores loading failed:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStores();
  }, []);

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <h1>Stores</h1>
          <p>View the online stores currently listed on PricePounce.</p>
        </div>

        <button
          className="primary-button"
          onClick={loadStores}
          disabled={loading}
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      <div className="store-summary-card">
        <div className="store-summary-icon">
          <StoreIcon size={24} />
        </div>

        <div>
          <strong>
            {stores.length} store{stores.length === 1 ? "" : "s"} listed
          </strong>
          <span>
            PricePounce shows public product information from these stores and
            links back to each one.
          </span>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">Loading store information...</div>
      ) : (
        <div className="stores-grid">
          {stores.map((store) => (
            <div className="store-card" key={store.name}>
              <div className="store-card-header">
                <div className="store-brand">
                  <div className="store-logo">
                    {store.name.charAt(0).toUpperCase()}
                  </div>

                  <div>
                    <h2>{store.name}</h2>
                    <span>Products listed from {store.name}.</span>
                  </div>
                </div>

                <div className="connection-status">
                  <CheckCircle2 size={16} />
                  Listed
                </div>
              </div>

              <div className="store-stats">
                <div>
                  <Package size={18} />
                  <strong>{store.product_count}</strong>
                  <span>Products</span>
                </div>

                <div>
                  <StoreIcon size={18} />
                  <strong>Active</strong>
                  <span>Tracking</span>
                </div>
              </div>

              <div className="store-card-footer">
                <span>Data source</span>
                <strong>{store.name}</strong>
              </div>
            </div>
          ))}
        </div>
      )}

      <NotAffiliated />
    </div>
  );
}

export default Stores;