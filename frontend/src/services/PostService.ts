export type CreatePostRequest = {
  content: string;
  routeId?: string;
  gpxFile?: File | null;
  startDateTime: string;
  endDateTime: string;
  routeColor: string;
  routeThumbnail: Blob;
};

export async function createPost(request: CreatePostRequest) {
  const formData = new FormData();

  formData.append("content", request.content);
  formData.append(
    "startDateTime",
    new Date(request.startDateTime).toISOString(), // toISOString converts it to UTC
  );
  formData.append("endDateTime", new Date(request.endDateTime).toISOString());

  if (request.routeId) {
    formData.append("routeId", request.routeId);
  }

  if (request.gpxFile) {
    formData.append("gpxFile", request.gpxFile);
  }

  formData.append("routeColor", request.routeColor);

  formData.append(
    "routeThumbnail",
    request.routeThumbnail,
    "route-thumbnail.png",
  );

  const response = await fetch("http://localhost:8080/posts", {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to create post.");
  }

  return response.json();
}
