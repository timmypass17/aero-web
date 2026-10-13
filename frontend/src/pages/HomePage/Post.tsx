import "./Post.css";
import defaultPfp from "../../assets/default-pfp.png";
import { useState } from "react";

interface PostResponse {
  id: string;

  firstName: string;
  lastName: string;
  username: string;
  profilePictureUrl: string | null;

  content: string;
  thumbnailUrl: string | null;
  likesCount: number;
  commentsCount: number;
  likedByCurrentUser: boolean;

  routeSource: string | null;
  routeId: string | null;
  routeColor: string | null;

  distance: number | null;
  elevationGain: number | null;
  durationSeconds: number | null;

  startTime: string | null;
  endTime: string | null;
  createdAt: string;
}

interface PageResponse<T> {
  content: T[]; // Actual data
  totalElements: number; // Total number of posts across all pages.
  totalPages: number; // Total number of pages available.
  number: number; // The current page number, starting at 0.
  size: number; // Maximum number of posts requested per page.
  numberOfElements: number; // Number of posts actually returned on this page.
  first: boolean;
  last: boolean;
}

interface PostProps {
  post: PostResponse;
}

function Post({ post }: PostProps) {
  const [liked, setLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<string[]>([]);
  const [commentDraft, setCommentDraft] = useState("");
  return (
    <li>
      <header className="post-header">
        <img
          src={post.profilePictureUrl ?? defaultPfp}
          alt="Profile picture"
          className="author-pfp"
        />

        <div className="post-header-content">
          <div className="author-info">
            <p className="author-name">
              {post.firstName} {post.lastName}
            </p>
            <p className="author-username">@{post.username}</p>
          </div>

          <time className="post-created-date" dateTime={post.createdAt}>
            {formatPostDate(post.createdAt)}
          </time>
        </div>

        <button
          type="button"
          className="post-menu-button"
          aria-label="Post options"
          onClick={() => console.log("Open post menu")}
        >
          ⋯
        </button>
      </header>
      <p>{post.content}</p>
      <div className="post-activity-stats">
        <div className="post-stat">
          <span className="post-stat-label">Distance</span>
          <span className="post-stat-value">
            <span className="post-stat-value">
              {post.distance != null
                ? `${(post.distance / 1000).toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })} km`
                : "—"}
            </span>{" "}
          </span>
        </div>

        <div className="post-stat">
          <span className="post-stat-label">Elevation</span>
          <span className="post-stat-value">
            {post.elevationGain != null
              ? `${post.elevationGain.toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                })} m`
              : "—"}
          </span>
        </div>

        <div className="post-stat">
          <span className="post-stat-label">Duration</span>
          <span className="post-stat-value">
            {formatDuration(post.durationSeconds)}
          </span>
        </div>
      </div>

      <div className="post-image-container">
        {post.thumbnailUrl && (
          <img
            src={post.thumbnailUrl}
            alt="Post image"
            className="post-image"
          />
        )}
      </div>

      <div className="post-actions">
        <button
          type="button"
          className="post-action comment-action"
          aria-label={`${comments.length} comments`}
          aria-expanded={showComments}
          onClick={() => setShowComments((current) => !current)}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinejoin="round"
            />
          </svg>
          <span>{comments.length}</span>
        </button>
        <button
          type="button"
          className={`post-action like-action ${liked ? "is-liked" : ""}`}
          aria-label={liked ? "Unlike post" : "Like post"}
          aria-pressed={liked}
          onClick={() => setLiked((current) => !current)}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z"
              fill={liked ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinejoin="round"
            />
          </svg>
          <span>{liked ? 1 : 0}</span>
        </button>
      </div>
      {showComments && (
        <div className="post-comments">
          <form
            className="comment-form"
            onSubmit={(event) => {
              event.preventDefault();

              const text = commentDraft.trim();
              if (!text) return;

              setComments((current) => [...current, text]);
              setCommentDraft("");
            }}
          >
            <input
              type="text"
              value={commentDraft}
              onChange={(event) => setCommentDraft(event.target.value)}
              placeholder="Write a comment..."
              aria-label="Write a comment"
            />
            <button type="submit" disabled={!commentDraft.trim()}>
              Reply
            </button>
          </form>

          {comments.map((comment, index) => (
            <p className="post-comment" key={index}>
              {comment}
            </p>
          ))}
        </div>
      )}
    </li>
  );
}

export function formatPostDate(value: string): string {
  // Normalize SQL-style timestamp to ISO-compatible format.
  const normalized = value
    .replace(" ", "T")
    .replace(/(\.\d{3})\d+/, "$1") // Microseconds -> milliseconds
    .replace(/([+-]\d{2})$/, "$1:00"); // -07 -> -07:00

  const date = new Date(normalized);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const now = new Date();

  const time = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (isSameDay(date, now)) {
    return `Today at ${time}`;
  }

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  if (isSameDay(date, yesterday)) {
    return `Yesterday at ${time}`;
  }

  const options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
  };

  if (date.getFullYear() !== now.getFullYear()) {
    options.year = "numeric";
  }

  return `${date.toLocaleDateString("en-US", options)} at ${time}`;
}

function formatDuration(seconds: number | null): string {
  if (seconds == null) return "—";

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours === 0) return `${minutes} min`;
  if (minutes === 0) return `${hours} hr`;

  return `${hours} hr ${minutes} min`;
}

export default Post;
export type { PostResponse, PageResponse };
