import { Link } from "react-router-dom";

function formatPrice(value) {
  if (value === null || value === undefined) {
    return "—";
  }

  return `₦${Number(value).toLocaleString()}`;
}

function ProductRow({ product }) {
  const hasDiscount =
    product.discount_percent !== null &&
    product.discount_percent !== undefined;

  return (
    <Link
      to={`/products/${product.id}`}
      className="product-row product-row-link"
    >
      <div className="product-name-cell">
        <div className="product-thumbnail">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt=""
            />
          ) : (
            <span>PP</span>
          )}
        </div>

        <div>
          <strong>{product.product_name}</strong>
          <small>{product.store_name}</small>

          <div className="product-mobile-meta">
            <span className="mobile-price">
              {formatPrice(product.current_price)}
            </span>

            {hasDiscount && (
              <span className="mobile-discount">
                {product.discount_percent}%
              </span>
            )}
          </div>
        </div>
      </div>

      <span>
        {formatPrice(product.current_price)}
      </span>

      <span className="old-price">
        {formatPrice(product.old_price)}
      </span>

      <span className="discount">
        {hasDiscount
          ? `${product.discount_percent}%`
          : "—"}
      </span>

      <span className="rating">
        ★ {product.rating ?? "—"}
      </span>
    </Link>
  );
}

export default ProductRow;