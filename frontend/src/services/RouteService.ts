import type { CyclingRoute } from "../types/CyclingRoute";

const API_URL = "http://localhost:8080";

export interface CreateRouteRequest {
    name: string;
    description: string;
    gpxFile: File;
    thumbnail: File | null;
    routeColor: string;
}

export async function createRoute(
    request: CreateRouteRequest
): Promise<CyclingRoute> {
    const formData = new FormData();

    formData.append("name", request.name);
    formData.append("description", request.description);
    formData.append("file", request.gpxFile);
    // TODO: Add thumbnail
    if (request.thumbnail) {
        formData.append("thumbnail", request.thumbnail);
    }
    formData.append("color", request.routeColor);

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

export type NearbyRoute = {
    id: string;
    name: string;
    description?: string;
};

export async function getRouteGpx(
    routeId: string
): Promise<string> {
    const response = await fetch(
        `http://localhost:8080/routes/${routeId}/gpx`,
        {
            credentials: "include",
        }
    );

    if (!response.ok) {
        throw new Error(
            "Failed to fetch route GPX."
        );
    }

    return response.text();
}