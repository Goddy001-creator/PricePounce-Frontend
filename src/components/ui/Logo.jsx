function Logo({ compact = false, light = false }) {
  return (
    <div className={`brand ${compact ? "brand-compact" : ""}`}>
      <div className="brand-mark">
        <svg
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient
              id="pulseGradient"
              x1="8"
              y1="8"
              x2="56"
              y2="58"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#60A5FA" />
              <stop offset="0.52" stopColor="#2563EB" />
              <stop offset="1" stopColor="#7C3AED" />
            </linearGradient>
          </defs>

          <path
            d="M18 17H46C50.4183 17 54 20.5817 54 25V51C54 55.4183 50.4183 59 46 59H18C13.5817 59 10 55.4183 10 51V25C10 20.5817 13.5817 17 18 17Z"
            fill="url(#pulseGradient)"
          />

          <path
            d="M21 17V12C21 7.58172 24.5817 4 29 4H35C39.4183 4 43 7.58172 43 12V17"
            stroke="#60A5FA"
            strokeWidth="4"
            strokeLinecap="round"
          />

          <path
            d="M17 40H24L29 32L34 42L40 29L47 29"
            stroke="white"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <circle
            cx="47"
            cy="29"
            r="3"
            fill="white"
          />
        </svg>
      </div>

      {!compact && (
        <div className="brand-text">
          <span className={light ? "brand-price light" : "brand-price"}>
            Price
          </span>
          <span className="brand-pulse">Pounce</span>
        </div>
      )}
    </div>
  );
}

export default Logo;