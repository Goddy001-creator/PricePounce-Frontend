import {
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  Package,
  RefreshCw,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";

import ProductRow from "../components/ui/ProductRow";
import { useAuth } from "../context/AuthContext";
import {
  getBrands,
  getCategories,
  getProductsPage,
} from "../services/api";

const STORE_OPTIONS = ["All Stores", "Jumia", "Konga"];
const PAGE_SIZE = 10;

const SORT_OPTIONS = [
  { value: "updated", label: "Recently updated" },
  { value: "name", label: "Name" },
  { value: "price", label: "Price" },
  { value: "discount", label: "Discount" },
  { value: "rating", label: "Rating" },
];

// Builds lists like [1, 2, 3] or [1, "start", 4, 5, 6, "end", 13]
function getPageItems(current, total) {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  const items = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  if (start > 2) items.push("start");

  for (let page = start; page <= end; page += 1) {
    items.push(page);
  }

  if (end < total - 1) items.push("end");

  items.push(total);
  return items;
}

function SortHeader({ label, sortKey, sort, order, onSort }) {
  const active = sort === sortKey;

  return (
    <button
      type="button"
      className={`sort-header ${active ? "active" : ""}`}
      onClick={() => onSort(sortKey)}
      aria-label={`Sort by ${label}`}
    >
      {label}
      {active &&
        (order === "asc" ? (
          <ArrowUp size={12} />
        ) : (
          <ArrowDown size={12} />
        ))}
    </button>
  );
}

function Products() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlQuery = (searchParams.get("q") || "").trim();

  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [searchInput, setSearchInput] = useState(urlQuery);
  const [storeFilter, setStoreFilter] = useState(
    user?.settings?.default_store || "All Stores"
  );
  const [categories, setCategories] = useState([]);
  const [categorySlug, setCategorySlug] = useState("");
  const [brands, setBrands] = useState([]);
  const [brand, setBrand] = useState("");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("updated");
  const [order, setOrder] = useState("desc");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const requestRef = useRef(0);

  const visibleCategories = categories.filter(
    (category) => category.product_count > 0
  );

  // The parent whose chip (or whose child's chip) is selected
  const activeParent =
    categories.find(
      (category) =>
        category.slug === categorySlug ||
        category.children.some((child) => child.slug === categorySlug)
    ) || null;

  const activeCategory = activeParent
    ? activeParent.slug === categorySlug
      ? activeParent
      : activeParent.children.find((child) => child.slug === categorySlug)
    : null;

  const filtersActive =
    Boolean(urlQuery) ||
    storeFilter !== "All Stores" ||
    Boolean(categorySlug) ||
    Boolean(brand);

  const sheetActive =
    storeFilter !== "All Stores" ||
    Boolean(brand) ||
    sort !== "updated" ||
    order !== "desc";

  // Categories load once
  useEffect(() => {
    let cancelled = false;

    getCategories()
      .then((data) => {
        if (!cancelled) setCategories(data.categories || []);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  // Brands follow the selected category
  useEffect(() => {
    let cancelled = false;

    getBrands(categorySlug)
      .then((data) => {
        if (!cancelled) setBrands(data.brands || []);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [categorySlug]);

  const loadProducts = useCallback(async () => {
    const requestId = requestRef.current + 1;
    requestRef.current = requestId;

    setLoading(true);
    setError("");

    try {
      const data = await getProductsPage({
        page,
        perPage: PAGE_SIZE,
        sort,
        order,
        q: urlQuery,
        store: storeFilter === "All Stores" ? "" : storeFilter,
        category: categorySlug,
        brand,
      });

      // Ignore answers from outdated requests
      if (requestId !== requestRef.current) return;

      setProducts(data.products || []);
      setTotal(data.total ?? 0);
      setTotalPages(data.total_pages ?? 1);

      if (data.total_pages && page > data.total_pages) {
        setPage(data.total_pages);
      }
    } catch (requestError) {
      if (requestId !== requestRef.current) return;

      console.error("Products loading failed:", requestError);
      setProducts([]);
      setTotal(0);
      setTotalPages(1);
      setError("Unable to load products. Make sure the backend is running.");
    } finally {
      if (requestId === requestRef.current) {
        setLoading(false);
      }
    }
  }, [page, sort, order, urlQuery, storeFilter, categorySlug, brand]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // The URL (?q=...) is the source of truth for the search term
  useEffect(() => {
    setSearchInput(urlQuery);
    setPage(1);
  }, [urlQuery]);

  function handleSearchSubmit(event) {
    event.preventDefault();

    const trimmedSearch = searchInput.trim();

    if (trimmedSearch === urlQuery) {
      if (page === 1) {
        loadProducts();
      } else {
        setPage(1);
      }
      return;
    }

    setSearchParams(trimmedSearch ? { q: trimmedSearch } : {});
  }

  function handleClearSearch() {
    setSearchInput("");
    setSearchParams({});
  }

  function handleStoreChange(value) {
    setStoreFilter(value);
    setPage(1);
  }

  function handleCategoryChange(slug) {
    setCategorySlug(slug);
    setBrand("");
    setPage(1);
  }

  function handleBrandChange(value) {
    setBrand(value);
    setPage(1);
  }

  function handleSort(key) {
    if (sort === key) {
      setOrder(order === "asc" ? "desc" : "asc");
    } else {
      setSort(key);
      setOrder(key === "name" ? "asc" : "desc");
    }

    setPage(1);
  }

  function handleSortSelect(value) {
    setSort(value);
    setOrder(value === "name" ? "asc" : "desc");
    setPage(1);
  }

  function handleOrderSelect(value) {
    setOrder(value);
    setPage(1);
  }

  function resetSheetFilters() {
    setStoreFilter("All Stores");
    setBrand("");
    setSort("updated");
    setOrder("desc");
    setPage(1);
  }

  function clearAllFilters() {
    setStoreFilter("All Stores");
    setCategorySlug("");
    setBrand("");
    setPage(1);
    handleClearSearch();
  }

  function goToPage(nextPage) {
    setPage(Math.min(Math.max(1, nextPage), totalPages));
  }

  const showingFrom = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const showingTo = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <h1>Products</h1>
          <p>
            Browse and compare products currently tracked by PricePounce.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={loadProducts}
          disabled={loading}
        >
          <RefreshCw
            size={17}
            className={loading ? "button-spinner" : ""}
          />
          Refresh
        </button>
      </div>

      <div className="products-toolbar">
        <form className="products-search" onSubmit={handleSearchSubmit}>
          <Search size={18} />

          <input
            type="text"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search products..."
            aria-label="Search products"
          />

          {searchInput && (
            <button
              type="button"
              className="search-clear-button"
              onClick={handleClearSearch}
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}

          <button type="submit" className="search-submit-button">
            Search
          </button>
        </form>

        <div className="products-filter">
          <SlidersHorizontal size={17} />

          <select
            value={storeFilter}
            onChange={(event) => handleStoreChange(event.target.value)}
            aria-label="Filter products by store"
          >
            {STORE_OPTIONS.map((store) => (
              <option key={store} value={store}>
                {store}
              </option>
            ))}
          </select>

          {brands.length > 0 && (
            <select
              value={brand}
              onChange={(event) => handleBrandChange(event.target.value)}
              aria-label="Filter products by brand"
            >
              <option value="">All Brands</option>
              {brands.map((item) => (
                <option key={item.brand} value={item.brand}>
                  {item.brand} ({item.product_count})
                </option>
              ))}
            </select>
          )}
        </div>

        <button
          type="button"
          className={`filter-button ${sheetActive ? "active" : ""}`}
          onClick={() => setFiltersOpen(true)}
          aria-label="Open filters"
        >
          <SlidersHorizontal size={19} />
        </button>
      </div>

      {visibleCategories.length > 0 && (
        <>
          <div className="category-bar" role="tablist" aria-label="Categories">
            <button
              type="button"
              className={`category-chip ${!categorySlug ? "active" : ""}`}
              onClick={() => handleCategoryChange("")}
            >
              All
            </button>

            {visibleCategories.map((category) => (
              <button
                key={category.id}
                type="button"
                className={`category-chip ${
                  activeParent?.id === category.id ? "active" : ""
                }`}
                onClick={() => handleCategoryChange(category.slug)}
              >
                {category.name}
                <small>{category.product_count}</small>
              </button>
            ))}
          </div>

          {activeParent &&
            activeParent.children.some((child) => child.product_count > 0) && (
              <div className="category-bar sub" aria-label="Sub-categories">
                <button
                  type="button"
                  className={`category-chip ${
                    categorySlug === activeParent.slug ? "active" : ""
                  }`}
                  onClick={() => handleCategoryChange(activeParent.slug)}
                >
                  All {activeParent.name}
                </button>

                {activeParent.children
                  .filter((child) => child.product_count > 0)
                  .map((child) => (
                    <button
                      key={child.id}
                      type="button"
                      className={`category-chip ${
                        categorySlug === child.slug ? "active" : ""
                      }`}
                      onClick={() => handleCategoryChange(child.slug)}
                    >
                      {child.name}
                      <small>{child.product_count}</small>
                    </button>
                  ))}
              </div>
            )}
        </>
      )}

      {filtersOpen && (
        <>
          <div
            className="filter-sheet-overlay"
            onClick={() => setFiltersOpen(false)}
          />

          <div
            className="filter-sheet"
            role="dialog"
            aria-modal="true"
            aria-label="Filters"
          >
            <div className="filter-sheet-header">
              <h2>Filters</h2>

              <button
                type="button"
                className="icon-button"
                onClick={() => setFiltersOpen(false)}
                aria-label="Close filters"
              >
                <X size={18} />
              </button>
            </div>

            <label className="sheet-field">
              <span>Store</span>
              <select
                value={storeFilter}
                onChange={(event) => handleStoreChange(event.target.value)}
              >
                {STORE_OPTIONS.map((store) => (
                  <option key={store} value={store}>
                    {store}
                  </option>
                ))}
              </select>
            </label>

            {brands.length > 0 && (
              <label className="sheet-field">
                <span>Brand</span>
                <select
                  value={brand}
                  onChange={(event) => handleBrandChange(event.target.value)}
                >
                  <option value="">All Brands</option>
                  {brands.map((item) => (
                    <option key={item.brand} value={item.brand}>
                      {item.brand} ({item.product_count})
                    </option>
                  ))}
                </select>
              </label>
            )}

            <label className="sheet-field">
              <span>Sort by</span>
              <select
                value={sort}
                onChange={(event) => handleSortSelect(event.target.value)}
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <div className="sheet-field">
              <span>Order</span>

              <div className="segmented">
                <button
                  type="button"
                  className={order === "asc" ? "active" : ""}
                  onClick={() => handleOrderSelect("asc")}
                >
                  Ascending
                </button>

                <button
                  type="button"
                  className={order === "desc" ? "active" : ""}
                  onClick={() => handleOrderSelect("desc")}
                >
                  Descending
                </button>
              </div>
            </div>

            <div className="sheet-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={resetSheetFilters}
              >
                Reset
              </button>

              <button
                type="button"
                className="primary-button"
                onClick={() => setFiltersOpen(false)}
              >
                Show results
              </button>
            </div>
          </div>
        </>
      )}

      {filtersActive && (
        <div className="active-filters">
          <div>
            <span>Showing:</span>

            {urlQuery && (
              <span className="filter-chip">
                Search: "{urlQuery}"
                <button
                  type="button"
                  onClick={handleClearSearch}
                  aria-label="Clear search filter"
                >
                  <X size={13} />
                </button>
              </span>
            )}

            {storeFilter !== "All Stores" && (
              <span className="filter-chip">
                Store: {storeFilter}
                <button
                  type="button"
                  onClick={() => handleStoreChange("All Stores")}
                  aria-label="Clear store filter"
                >
                  <X size={13} />
                </button>
              </span>
            )}

            {activeCategory && (
              <span className="filter-chip">
                Category: {activeCategory.name}
                <button
                  type="button"
                  onClick={() => handleCategoryChange("")}
                  aria-label="Clear category filter"
                >
                  <X size={13} />
                </button>
              </span>
            )}

            {brand && (
              <span className="filter-chip">
                Brand: {brand}
                <button
                  type="button"
                  onClick={() => handleBrandChange("")}
                  aria-label="Clear brand filter"
                >
                  <X size={13} />
                </button>
              </span>
            )}
          </div>

          <span className="result-count">
            {total} result
            {total === 1 ? "" : "s"}
          </span>
        </div>
      )}

      {loading ? (
        <div className="content-card products-loading-card">
          <RefreshCw size={28} className="loading-icon" />
          <h3>Loading products...</h3>
          <p>Fetching the latest product data from PricePounce.</p>
        </div>
      ) : error ? (
        <div className="content-card products-error-card">
          <div className="products-state-icon">
            <Package size={28} />
          </div>
          <h3>Unable to load products</h3>
          <p>{error}</p>

          <button className="primary-button" onClick={loadProducts}>
            <RefreshCw size={17} />
            Try Again
          </button>
        </div>
      ) : total === 0 ? (
        <div className="content-card products-empty-card">
          <div className="products-state-icon">
            <Package size={28} />
          </div>

          <h3>
            {filtersActive ? "No matching products" : "No products available"}
          </h3>

          <p>
            {filtersActive
              ? "Try changing your search, category or filters."
              : "PricePounce has not loaded any products yet."}
          </p>

          {filtersActive && (
            <button className="secondary-button" onClick={clearAllFilters}>
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="content-card products-table-card">
          <div className="products-table-heading">
            <div>
              <h2>Tracked Products</h2>
              <p>
                {total} product
                {total === 1 ? "" : "s"}{" "}
                {filtersActive ? "matching" : "currently tracked"}
              </p>
            </div>

            <div className="products-source-badge">
              <Package size={15} />
              Live backend data
            </div>
          </div>

          <div className="products-table">
            <div className="product-row product-row-header">
              <SortHeader
                label="Product"
                sortKey="name"
                sort={sort}
                order={order}
                onSort={handleSort}
              />

              <SortHeader
                label="Current Price"
                sortKey="price"
                sort={sort}
                order={order}
                onSort={handleSort}
              />

              <span>Original Price</span>

              <SortHeader
                label="Discount"
                sortKey="discount"
                sort={sort}
                order={order}
                onSort={handleSort}
              />

              <SortHeader
                label="Rating"
                sortKey="rating"
                sort={sort}
                order={order}
                onSort={handleSort}
              />
            </div>

            <div className="product-row-list">
              {products.map((product) => (
                <ProductRow
                  key={product.id}
                  product={product}
                />
              ))}
            </div>
          </div>

          <div className="pagination-bar">
            <span className="pagination-summary">
              Showing {showingFrom} to {showingTo} of {total}{" "}
              {total === 1 ? "product" : "products"}
            </span>

            {totalPages > 1 && (
              <nav className="pagination" aria-label="Products pages">
                <button
                  type="button"
                  className="pagination-button"
                  onClick={() => goToPage(page - 1)}
                  disabled={page === 1}
                  aria-label="Previous page"
                >
                  <ChevronLeft size={16} />
                </button>

                {getPageItems(page, totalPages).map((item) =>
                  typeof item === "string" ? (
                    <span key={item} className="pagination-ellipsis">
                      …
                    </span>
                  ) : (
                    <button
                      key={item}
                      type="button"
                      className={`pagination-button ${
                        item === page ? "active" : ""
                      }`}
                      onClick={() => goToPage(item)}
                      aria-label={`Page ${item}`}
                      aria-current={item === page ? "page" : undefined}
                    >
                      {item}
                    </button>
                  )
                )}

                <button
                  type="button"
                  className="pagination-button"
                  onClick={() => goToPage(page + 1)}
                  disabled={page === totalPages}
                  aria-label="Next page"
                >
                  <ChevronRight size={16} />
                </button>
              </nav>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Products;