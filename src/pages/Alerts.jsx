import {
  Bell,
  CheckCircle2,
  Mail,
  MessageCircle,
  TrendingDown,
} from "lucide-react";

function Alerts() {
  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <h1>Alerts</h1>
          <p>
            Monitor price-drop alerts detected by PricePounce.
          </p>
        </div>
      </div>

      <section className="alert-summary-grid">
        <div className="alert-summary-card">
          <div className="alert-summary-icon blue">
            <Bell size={20} />
          </div>

          <div>
            <span>Total Alerts</span>
            <strong>0</strong>
          </div>
        </div>

        <div className="alert-summary-card">
          <div className="alert-summary-icon green">
            <TrendingDown size={20} />
          </div>

          <div>
            <span>Price Drops</span>
            <strong>0</strong>
          </div>
        </div>

        <div className="alert-summary-card">
          <div className="alert-summary-icon purple">
            <CheckCircle2 size={20} />
          </div>

          <div>
            <span>Notification Status</span>
            <strong>V1</strong>
          </div>
        </div>
      </section>

      <div className="content-card alerts-card">
        <div className="card-heading">
          <div>
            <h2>Price Drop Alerts</h2>
            <p>
              PricePounce detects when a tracked product's price decreases.
            </p>
          </div>
        </div>

        <div className="alerts-empty-state">
          <div className="alerts-empty-icon">
            <Bell size={28} />
          </div>

          <h3>No price-drop alerts yet</h3>

          <p>
            When a tracked product records a lower price, it can appear here.
          </p>
        </div>
      </div>

      <div className="content-card notification-info-card">
        <div className="card-heading">
          <div>
            <h2>Notification Channels</h2>
            <p>
              External notification delivery is planned for a future version.
            </p>
          </div>
        </div>

        <div className="notification-channel-list">
          <div className="notification-channel">
            <div className="notification-channel-icon">
              <Mail size={20} />
            </div>

            <div>
              <strong>Email Notifications</strong>
              <span>Planned for a future PricePounce version.</span>
            </div>

            <span className="planned-badge">Planned</span>
          </div>

          <div className="notification-channel">
            <div className="notification-channel-icon">
              <MessageCircle size={20} />
            </div>

            <div>
              <strong>WhatsApp Notifications</strong>
              <span>Planned for a future PricePounce version.</span>
            </div>

            <span className="planned-badge">Planned</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Alerts;