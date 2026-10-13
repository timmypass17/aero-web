interface PostResponse {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  content: string;

  thumbnailUrl: string | null;

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

interface PostProps {
  post: PostResponse;
}

function Post({ post }: PostProps) {
  return (
    <li>
      <p>
        <div>
          {post.firstName} {post.lastName}
        </div>
        <div>Today at </div>
      </p>
    </li>
  );
}

export function formatPostCreatedAt(value: string, now = new Date()): string {
  // Convert "2026-10-13 10:57:45.845098"
  // to a JavaScript-compatible timestamp with milliseconds.
  const normalized = value.replace(" ", "T").replace(/(\.\d{3})\d+/, "$1");

  const date = new Date(normalized);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const time = date
    .toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
    .replace(/\s(?=[AP]M)/i, "");

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

  const dateLabel = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    ...(date.getFullYear() !== now.getFullYear() ? { year: "numeric" } : {}),
  });

  return `${dateLabel} at ${time}`;
}

export default Post;
export type { PostResponse };
