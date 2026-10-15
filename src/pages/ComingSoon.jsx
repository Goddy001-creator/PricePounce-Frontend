const SUPPORT_EMAIL = "support@pricepounce.app";

const FEATURES = [
  {
    title: "Price history",
    text: "See how a product's price has moved over time, not just today's number.",
  },
  {
    title: "Deal insights",
    text: "Spot genuine bargains and know when a price is near its lowest.",
  },
  {
    title: "Price alerts",
    text: "Get an email when a product you're watching drops in price.",
  },
];

export default function ComingSoon() {
  return (
    <div className="coming-soon">
      <main className="coming-soon-main">
        <div className="coming-soon-brand">PricePounce</div>

        <h1>Smarter shopping in Nigeria is on its way.</h1>

        <p className="coming-soon-lead">
          PricePounce tracks prices on products from online stores in Nigeria,
          so you can see price history, spot real deals and never miss a drop.
        </p>

        <div className="coming-soon-grid">
          {FEATURES.map((feature) => (
            <div className="coming-soon-card" key={feature.title}>
              <h2>{feature.title}</h2>
              <p>{feature.text}</p>
            </div>
          ))}
        </div>

        <p className="coming-soon-contact">
          We're getting ready to launch. Questions?{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
        </p>
      </main>

      <footer className="coming-soon-footer">
        © {new Date().getFullYear()} PricePounce. An independent service, not
        affiliated with any store.
      </footer>
    </div>
  );
}