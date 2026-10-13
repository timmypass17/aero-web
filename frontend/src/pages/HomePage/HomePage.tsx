import Post, { type PageResponse, type PostResponse } from "./Post";
import "./HomePage.css";
import { useEffect, useState } from "react";

function HomePage() {
  const [posts, setPosts] = useState<PostResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPosts(page: number) {
      try {
        const params = new URLSearchParams({
          page: String(page),
          size: "20",
        });

        const response = await fetch(`http://localhost:8080/posts?${params}`);
        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`);
        }

        const data: PageResponse<PostResponse> = await response.json();
        setPosts(data.content);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unexpected error occurred");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchPosts(0);
  }, []);

  if (loading) {
    return <p>Loading posts...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <ol className="home-page-container">
      {posts.map((post) => {
        return <Post key={post.id} post={post} />;
      })}
    </ol>
  );
}

export default HomePage;
