import Post, { type PostResponse } from "./Post";
import "./HomePage.css";
const mockPosts: PostResponse[] = [
  {
    id: "550e8400-e29b-41d4-a716-446655440001",
    firstName: "Timmy",
    lastName: "Nguyen",
    username: "timmyrides",
    content: "Beautiful morning ride around San Jose!",
    thumbnailUrl: "/images/route-thumbnail-1.png",
    routeSource: "GPX",
    routeId: "550e8400-e29b-41d4-a716-446655440002",
    routeColor: "#e66465",
    distance: 32.5,
    elevationGain: 450,
    durationSeconds: 5400,
    startTime: "2026-10-13T08:00:00",
    endTime: "2026-10-13T09:30:00",
    createdAt: "2026-10-13 12:22:04.42169-07",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440003",
    firstName: "Alex",
    lastName: "Chen",
    username: "alexcycles",
    content: "Explored a new route this weekend!",
    thumbnailUrl: null,
    routeSource: null,
    routeId: null,
    routeColor: null,
    distance: null,
    elevationGain: null,
    durationSeconds: null,
    startTime: null,
    endTime: null,
    createdAt: "2026-10-13 12:22:04.42169-07",
  },
];

function HomePage() {
  const posts = mockPosts.map((post) => {
    return <Post key={post.id} post={post} />;
  });

  return <ol className="home-page-container">{posts}</ol>;
}

export default HomePage;
