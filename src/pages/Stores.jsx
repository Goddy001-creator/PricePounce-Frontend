import { CheckCircle2, Package, RefreshCw, Store as StoreIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { getStoreProducts } from "../services/api";

const STORES = [
  {
    name: "Jumia",
    description: "Products tracked from Jumia Nigeria.",
    initial: "J",
  },
  {
    name: "Konga",
    description: "Products tracked from Konga Nigeria.",
    initial: "K",
  },
];

function Stores() {
  const [storeData, setStoreData] = useState({});
  const [loading, setLoading] = useState(true);

  async function loadStores() {
    setLoading(true);

    try {
      const results = await Promise.all(
        STORES.map(async (store) => {
          const data = await getStoreProducts(store.name);
          return [store.name, data];
        })
      );

      setStoreData(Object.fromEntries(results));
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
          <p>
            View the online stores currently tracked by PricePounce.
          </p>
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
          <strong>2 stores tracked</strong>
          <span>
            PricePounce currently collects product data from Jumia and Konga.
          </span>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          Loading store information...
        </div>
      ) : (
        <div className="stores-grid">
          {STORES.map((store) => {
            const data = storeData[store.name];
            const products = data?.products || [];

            return (
              <div className="store-card" key={store.name}>
                <div className="store-card-header">
                  <div className="store-brand">
                    <div className="store-logo">
                      {store.initial}
                    </div>

                    <div>
                      <h2>{store.name}</h2>
                      <span>{store.description}</span>
                    </div>
                  </div>

                  <div className="connection-status">
                    <CheckCircle2 size={16} />
                    Connected
                  </div>
                </div>

                <div className="store-stats">
                  <div>
                    <Package size={18} />
                    <strong>{products.length}</strong>
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
                  <strong>{store.name} Nigeria</strong>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Stores;