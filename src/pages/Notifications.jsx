import { Bell, CheckCheck, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";

import { useNotifications } from "../context/NotificationsContext";
import { initials, timeAgo } from "./Community";

function formatPrice(value) {
  if (value === null || value === undefined) return null;
  return `₦${Number(value).toLocaleString()}`;
}

function Notifications() {
  const {
    notifications,
    isUnread,
    unreadCount,
    loading,
    error,
    markRead,
    markAllRead,
    reload,
  } = useNotifications();

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <h1>Notifications</h1>
          <p>Replies to your comments and big price cuts on your tracked stores.</p>
        </div>

        <button
          className="secondary-button"
          onClick={markAllRead}
          disabled={unreadCount === 0}
        >
          <CheckCheck size={17} />
          Mark all as read
        </button>
      </div>

      <div className="content-card">
        <div className="card-heading">
          <div>
            <h2>Latest</h2>
            <p>
              {unreadCount} unread of {notifications.length}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="loading-state">Loading notifications...</div>
        ) : error ? (
          <div className="empty-state">
            <div>
              Unable to load notifications. Make sure the backend is running.
              <br />
              <button
                className="secondary-button"
                style={{ marginTop: 12 }}
                onClick={reload}
              >
                <RefreshCw size={16} />
                Try Again
              </button>
            </div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="empty-state">
            <div>
              <Bell size={24} />
              <br />
              No notifications yet.
            </div>
          </div>
        ) : (
          <div className="notification-list">
            {notifications.map((item) => {
              const unread = isUnread(item);

              if (item.type === "community") {
                return (
                  <Link
                    key={item.id}
                    to={`/community/${item.postId}`}
                    className={`notification-item ${unread ? "unread" : ""}`}
                    onClick={() => markRead(item.id)}
                  >
                    <div className="mini-thumbnail">{initials(item.actor)}</div>

                    <div className="notification-body">
                      <strong>
                        {item.actor}{" "}
                        {item.kind === "reply"
                          ? "replied to your comment"
                          : "commented on your post"}
                      </strong>
                      <span>
                        {item.snippet} · {timeAgo(item.createdAt)}
                      </span>
                    </div>

                    <span className="notification-badge">
                      {item.kind === "reply" ? "Reply" : "Comment"}
                    </span>

                    {unread && <span className="notification-unread-dot" />}
                  </Link>
                );
              }

              const price = formatPrice(item.newPrice);

              return (
                <Link
                  key={item.id}
                  to={`/products/${item.productId}`}
                  className={`notification-item ${unread ? "unread" : ""}`}
                  onClick={() => markRead(item.id)}
                >
                  <div className="mini-thumbnail">
                    {item.imageUrl ? <img src={item.imageUrl} alt="" /> : "PP"}
                  </div>

                  <div className="notification-body">
                    <strong>{item.productName}</strong>
                    <span>
                      {item.dropPercent}% off
                      {item.storeName ? ` at ${item.storeName}` : ""}
                      {price ? ` · now ${price}` : ""}
                    </span>
                  </div>

                  <span className="notification-badge">-{item.dropPercent}%</span>

                  {unread && <span className="notification-unread-dot" />}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Notifications;