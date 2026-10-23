import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, MapPin, Send } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import {
  addCommunityComment,
  deleteCommunityComment,
  editCommunityComment,
  getCommunityPost,
  getMyCommunityComments,
} from "../services/api";
import { initials, naira, timeAgo } from "./Community";

function CommentBox({
  postId,
  parentId = null,
  placeholder,
  onDone,
  onCancel,
  autoFocus,
  initial = "",
  editId = null,
  replyToId = null,
}) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [body, setBody] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const formRef = useRef(null);
  const areaRef = useRef(null);

  function grow() {
    const area = areaRef.current;

    if (area) {
      area.style.height = "auto";
      area.style.height = `${Math.min(area.scrollHeight, 160)}px`;
    }
  }

  useEffect(() => {
    grow();

    if (autoFocus && areaRef.current) {
      const area = areaRef.current;
      area.focus();
      area.setSelectionRange(area.value.length, area.value.length);
    }
  }, [autoFocus]);

  async function submit(event) {
    event.preventDefault();

    if (!body.trim() || busy) return;

    setBusy(true);
    setError("");

    try {
      if (editId) {
        await editCommunityComment(editId, body);
      } else {
        await addCommunityComment(postId, body, parentId, replyToId);
        setBody("");
        requestAnimationFrame(grow);
      }

      onDone();
    } catch (err) {
      setError(
        err.response?.data?.error || "Could not save your comment. Try again."
      );
    } finally {
      setBusy(false);
    }
  }

  if (!user) {
    return (
      <button
        type="button"
        className="cm-login-pill"
        onClick={() => navigate("/login")}
      >
        Log in to join the conversation
      </button>
    );
  }

  return (
    <form className="cm-compose" ref={formRef} onSubmit={submit}>
      <div className="cm-compose-row">
        <div className="cm-avatar cm-av-0 cm-av-small">
          {initials(user.name || "You")}
        </div>

        <div className="cm-compose-field">
          <textarea
            ref={areaRef}
            rows={1}
            value={body}
            maxLength={1000}
            placeholder={placeholder}
            aria-label={placeholder}
            onChange={(event) => {
              setBody(event.target.value);
              grow();
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                formRef.current?.requestSubmit();
              }

              if (event.key === "Escape" && onCancel) {
                onCancel();
              }
            }}
          />

          <button
            type="submit"
            className="cm-send"
            disabled={busy || !body.trim()}
            aria-label={editId ? "Save" : "Send"}
          >
            <Send size={17} />
          </button>
        </div>
      </div>

      {body.length > 800 && (
        <div className="cm-counter">{body.length} / 1000</div>
      )}
      {error && <div className="cm-error">{error}</div>}

      {onCancel && (
        <button type="button" className="cm-link cm-cancel" onClick={onCancel}>
          Cancel
        </button>
      )}
    </form>
  );
}

function Comment({
  comment,
  small = false,
  mine,
  editing,
  confirming,
  onReply,
  onEdit,
  onAskDelete,
  onDelete,
  onCancel,
  editor,
}) {
  return (
    <div className="cm-comment">
      <div
        className={`cm-avatar cm-av-${comment.id % 4} ${small ? "cm-av-small" : ""}`}
      >
        {initials(comment.author)}
      </div>

      <div className="cm-comment-body">
        <div className="cm-comment-head">
          <span className="cm-author">{comment.author}</span>
          {comment.is_author && <span className="cm-tag">Author</span>}
          <span className="cm-meta">{timeAgo(comment.created_at)}</span>
          {comment.edited && <span className="cm-edited">edited</span>}
        </div>

        {editing ? (
          editor
        ) : (
          <>
            <div className="cm-comment-text">{comment.body}</div>

            <div className="cm-actions">
              <button type="button" className="cm-link" onClick={onReply}>
                Reply
              </button>

              {mine && !confirming && (
                <>
                  <button type="button" className="cm-link" onClick={onEdit}>
                    Edit
                  </button>
                  <button
                    type="button"
                    className="cm-link cm-danger"
                    onClick={onAskDelete}
                  >
                    Delete
                  </button>
                </>
              )}

              {mine && confirming && (
                <span className="cm-confirm">
                  Delete this{small ? "" : " and its replies"}?
                  <button
                    type="button"
                    className="cm-link cm-danger"
                    onClick={onDelete}
                  >
                    Yes
                  </button>
                  <button type="button" className="cm-link" onClick={onCancel}>
                    No
                  </button>
                </span>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function CommunityPost() {
  const { postId } = useParams();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [mineIds, setMineIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);

  const load = useCallback(async () => {
    try {
      const data = await getCommunityPost(postId);
      setPost(data.post);
      setComments(data.comments);
      setError("");

      if (user) {
        try {
          const mine = await getMyCommunityComments(postId);
          setMineIds(mine.comments);
        } catch {
          setMineIds([]);
        }
      } else {
        setMineIds([]);
      }
    } catch (err) {
      setError(
        err.response?.status === 404
          ? "This post is no longer available."
          : "Could not load this post. Please try again shortly."
      );
    } finally {
      setLoading(false);
    }
  }, [postId, user]);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  function closeAll() {
    setReplyTo(null);
    setEditingId(null);
    setConfirmId(null);
  }

  async function remove(commentId) {
    try {
      await deleteCommunityComment(commentId);
      closeAll();
      load();
    } catch (err) {
      setError(err.response?.data?.error || "Could not delete the comment.");
    }
  }

  const topLevel = comments.filter((item) => item.parent_id === null);
  const repliesOf = (id) => comments.filter((item) => item.parent_id === id);
  const isMine = (id) => mineIds.includes(id);

  function renderComment(comment, topId, small) {
    return (
      <Comment
        key={comment.id}
        comment={comment}
        small={small}
        mine={isMine(comment.id)}
        editing={editingId === comment.id}
        confirming={confirmId === comment.id}
        onReply={() => {
          setEditingId(null);
          setConfirmId(null);
          setReplyTo({
            parentId: topId,
            mention: comment.author,
            replyToId: comment.id,
          });
        }}
        onEdit={() => {
          setReplyTo(null);
          setConfirmId(null);
          setEditingId(comment.id);
        }}
        onAskDelete={() => {
          setReplyTo(null);
          setEditingId(null);
          setConfirmId(comment.id);
        }}
        onDelete={() => remove(comment.id)}
        onCancel={closeAll}
        editor={
          <CommentBox
            postId={post.id}
            editId={comment.id}
            initial={comment.body}
            placeholder="Edit your comment"
            autoFocus
            onCancel={closeAll}
            onDone={() => {
              closeAll();
              load();
            }}
          />
        }
      />
    );
  }

  return (
    <div className="cm-page">
      <Link to="/community" className="cm-back">
        <ArrowLeft size={18} />
        Back to community
      </Link>

      {loading && <p className="cm-note-text">Loading...</p>}
      {error && <p className="cm-error">{error}</p>}

      {post && (
        <>
          <article className="cm-card cm-card-big">
            <div className="cm-card-head">
              <div className={`cm-avatar cm-av-${post.id % 4}`}>
                {initials(post.author)}
              </div>
              <div className="cm-card-who">
                <div className="cm-author">{post.author}</div>
                <div className="cm-meta">{timeAgo(post.created_at)}</div>
              </div>
              <span className="cm-badge">{post.category}</span>
            </div>

            <h1 className="cm-item cm-item-big">{post.item}</h1>
            <div className="cm-price cm-price-big">{naira(post.price)}</div>

            <div className="cm-place">
              <MapPin size={14} />
              {post.location}
            </div>

            {post.note && <div className="cm-note">{post.note}</div>}

            {post.self_reported && (
              <div className="cm-seen">Paid or seen by the poster</div>
            )}
          </article>

          <CommentBox
            postId={post.id}
            placeholder="Add a comment..."
            onDone={load}
          />

          <div className="cm-comments-title">
            {post.comment_count}{" "}
            {post.comment_count === 1 ? "comment" : "comments"}
          </div>

          {topLevel.length === 0 && (
            <p className="cm-note-text">
              No comments yet. Start the conversation.
            </p>
          )}

          {topLevel.map((comment) => (
            <div className="cm-thread" key={comment.id}>
              {renderComment(comment, comment.id, false)}

              {(repliesOf(comment.id).length > 0 ||
                replyTo?.parentId === comment.id) && (
                <div className="cm-replies">
                  {repliesOf(comment.id).map((reply) =>
                    renderComment(reply, comment.id, true)
                  )}

                  {replyTo?.parentId === comment.id && (
                    <CommentBox
                      postId={post.id}
                      parentId={comment.id}
                      replyToId={replyTo.replyToId}
                      initial={`@${replyTo.mention} `}
                      placeholder={`Reply to ${replyTo.mention}`}
                      autoFocus
                      onCancel={closeAll}
                      onDone={() => {
                        closeAll();
                        load();
                      }}
                    />
                  )}
                </div>
              )}
            </div>
          ))}
        </>
      )}
    </div>
  );
}

export default CommunityPost;