import type { CyclingRoute } from "../types/CyclingRoute";

const API_URL = "http://localhost:8080";

export async function uploadRoute(
    file: File,
    color: string
): Promise<CyclingRoute> {
    const formData = new FormData();

    formData.append("file", file);
    formData.append("name", file.name);
    formData.append("color", color);

    const response = await fetch(
        `${API_URL}/routes`,
        {
            method: "POST",
            body: formData,
            credentials: "include",
        }
    );

    if (!response.ok) {
        throw new Error("Failed to upload route");
    }

    return response.json();
}

export async function getNearbyRoutes(
    latitude: number,
    longitude: number,
    radius: number
): Promise<CyclingRoute[]> {
    const response = await fetch(
        `${API_URL}/routes?latitude=${latitude}&longitude=${longitude}&radius=${radius}`,
        {
            credentials: "include",
        }
    );

    if (!response.ok) {
        throw new Error(
            "Failed to fetch nearby routes"
        );
    }

    return response.json();
}
