import { useCallback, useEffect, useRef, useState } from "react";
import { MapPin, MessageCircle, Plus, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { createCommunityPost, getCommunityPosts } from "../services/api";

export const CATEGORIES = ["Groceries", "Currency", "Phones", "Fuel and gas", "More"];
export const WHEN = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "earlier", label: "Earlier" },
];

export function naira(value) {
  return `₦${Number(value).toLocaleString("en-NG", {
    maximumFractionDigits: 2,
  })}`;
}

export function timeAgo(iso) {
  const seconds = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);

  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) {
    const hours = Math.floor(seconds / 3600);
    return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  }

  const days = Math.floor(seconds / 86400);
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;

  return new Date(iso).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
  });
}

export function initials(name) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function PostCard({ post }) {
  const tone = post.id % 4;

  return (
    <article className="cm-card">
      <div className="cm-card-head">
        <div className={`cm-avatar cm-av-${tone}`}>{initials(post.author)}</div>
        <div className="cm-card-who">
          <div className="cm-author">{post.author}</div>
          <div className="cm-meta">
            {timeAgo(post.created_at)}
            {post.edited && <span className="cm-edited">edited</span>}
          </div>
        </div>
        <span className="cm-badge">{post.category}</span>
      </div>

      <Link to={`/community/${post.id}`} className="cm-item">
        {post.item}
      </Link>
      <div className="cm-price">{naira(post.price)}</div>

      <div className="cm-place">
        <MapPin size={14} />
        {post.location}
      </div>

      {post.note && <div className="cm-note">{post.note}</div>}

      <div className="cm-card-foot">
        <Link to={`/community/${post.id}`} className="cm-count">
          <MessageCircle size={16} />
          {post.comment_count}{" "}
          {post.comment_count === 1 ? "comment" : "comments"}
        </Link>
        {post.self_reported && (
          <span className="cm-seen">Paid or seen by the poster</span>
        )}
      </div>
    </article>
  );
}

function ShareForm({ sheet = false, onPosted, onClose }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [item, setItem] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("Groceries");
  const [when, setWhen] = useState("today");
  const [note, setNote] = useState("");
  const [self, setSelf] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();

    if (!user) {
      navigate("/login");
      return;
    }

    setBusy(true);
    setError("");

    try {
      await createCommunityPost({
        item,
        price: parseFloat(price.replace(/,/g, "")),
        location,
        category,
        when,
        note,
        self_reported: self,
      });

      setItem("");
      setPrice("");
      setLocation("");
      setNote("");
      setSelf(false);
      setWhen("today");
      onPosted();
    } catch (err) {
      setError(
        err.response?.data?.error || "Could not post. Please try again."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className={sheet ? "cm-form cm-form-sheet" : "cm-form"} onSubmit={submit}>
      <div className="cm-form-title">
        {sheet ? "Share a price" : "What did you pay?"}
        {sheet && (
          <button
            type="button"
            className="cm-close"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={22} />
          </button>
        )}
      </div>

      <label className="cm-field">
        {sheet ? "What did you buy?" : "Item"}
        <input
          type="text"
          value={item}
          maxLength={120}
          placeholder="e.g. 50kg bag of rice"
          onChange={(e) => setItem(e.target.value)}
          required
        />
      </label>

      <div className="cm-row">
        <label className="cm-field">
          Price paid (₦)
          <input
            type="text"
            inputMode="decimal"
            value={price}
            placeholder="0"
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </label>

        <label className="cm-field">
          Where
          <input
            type="text"
            value={location}
            maxLength={120}
            placeholder="Shop or market, city"
            onChange={(e) => setLocation(e.target.value)}
            required
          />
        </label>
      </div>

      {sheet ? (
        <>
          <div className="cm-field">
            Category
            <div className="cm-chips">
              {CATEGORIES.map((name) => (
                <button
                  type="button"
                  key={name}
                  className={`cm-chip ${category === name ? "on" : ""}`}
                  onClick={() => setCategory(name)}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          <div className="cm-field">
            When
            <div className="cm-when">
              {WHEN.map((option) => (
                <button
                  type="button"
                  key={option.value}
                  className={`cm-when-btn ${when === option.value ? "on" : ""}`}
                  onClick={() => setWhen(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <label className="cm-field">
            Note (optional)
            <textarea
              rows={2}
              value={note}
              maxLength={500}
              placeholder="Quantity, quality, anything useful"
              onChange={(e) => setNote(e.target.value)}
            />
          </label>

          <label className="cm-check">
            <input
              type="checkbox"
              checked={self}
              onChange={(e) => setSelf(e.target.checked)}
            />
            I paid or saw this price myself
          </label>
        </>
      ) : (
        <div className="cm-row cm-row-end">
          <label className="cm-field">
            Category
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </label>

          <label className="cm-check">
            <input
              type="checkbox"
              checked={self}
              onChange={(e) => setSelf(e.target.checked)}
            />
            I paid or saw this myself
          </label>
        </div>
      )}

      {error && <div className="cm-error">{error}</div>}

      <div className="cm-form-foot">
        {!sheet && (
          <span className="cm-hint">Posts are public. Be accurate and respectful.</span>
        )}
        <button type="submit" className="cm-submit" disabled={busy}>
          {busy ? "Posting..." : user ? "Post price" : "Log in to post"}
        </button>
      </div>
    </form>
  );
}

function Community() {
  const [category, setCategory] = useState("All");
  const [posts, setPosts] = useState([]);
  const [nextBefore, setNextBefore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const requestId = useRef(0);
  const composerRef = useRef(null);

  const loadFirst = useCallback(async (selected) => {
    const id = ++requestId.current;
    setLoading(true);
    setError("");

    try {
      const data = await getCommunityPosts({
        category: selected === "All" ? "" : selected,
      });

      if (id !== requestId.current) return;

      setPosts(data.posts);
      setNextBefore(data.next_before);
    } catch {
      if (id === requestId.current) {
        setError("Could not load posts. Please try again shortly.");
      }
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFirst(category);
  }, [category, loadFirst]);

  async function loadMore() {
    setLoadingMore(true);

    try {
      const data = await getCommunityPosts({
        category: category === "All" ? "" : category,
        before: nextBefore,
      });

      setPosts((current) => [...current, ...data.posts]);
      setNextBefore(data.next_before);
    } catch {
      setError("Could not load more posts.");
    } finally {
      setLoadingMore(false);
    }
  }

  useEffect(() => {
    if (!sheetOpen) return undefined;

    const onKey = (event) => {
      if (event.key === "Escape") setSheetOpen(false);
    };

    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [sheetOpen]);

  function openShare() {
    if (window.matchMedia("(max-width: 700px)").matches) {
      setSheetOpen(true);
      return;
    }

    composerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    composerRef.current?.querySelector("input")?.focus();
  }

  function handlePosted() {
    setSheetOpen(false);
    setCategory("All");
    loadFirst("All");
  }

  return (
    <div className="cm-page">
      <div className="cm-top">
        <div className="cm-top-text">
          <h1>Community prices</h1>
          <p>What people in Nigeria are actually paying, right now.</p>
        </div>

        <button type="button" className="cm-share" onClick={openShare}>
          <Plus size={18} />
          Share a price
        </button>
      </div>

      <div className="cm-chips cm-chips-scroll" role="tablist" aria-label="Category">
        {["All", ...CATEGORIES].map((name) => (
          <button
            type="button"
            key={name}
            className={`cm-chip ${category === name ? "on" : ""}`}
            onClick={() => setCategory(name)}
          >
            {name}
          </button>
        ))}
      </div>

      <div className="cm-inline" ref={composerRef}>
        <ShareForm onPosted={handlePosted} />
      </div>

      {loading && <p className="cm-note-text">Loading prices...</p>}
      {error && <p className="cm-error">{error}</p>}

      {!loading && !error && posts.length === 0 && (
        <p className="cm-note-text">
          No prices here yet. Be the first to share one.
        </p>
      )}

      <div className="cm-feed">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      {nextBefore && !loading && (
        <button
          type="button"
          className="cm-more"
          onClick={loadMore}
          disabled={loadingMore}
        >
          {loadingMore ? "Loading..." : "Load more"}
        </button>
      )}

      {sheetOpen && (
        <div
          className="cm-overlay"
          role="dialog"
          aria-modal="true"
          onClick={(event) => {
            if (event.target === event.currentTarget) setSheetOpen(false);
          }}
        >
          <div className="cm-sheet">
            <div className="cm-grip" />
            <ShareForm
              sheet
              onPosted={handlePosted}
              onClose={() => setSheetOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default Community;