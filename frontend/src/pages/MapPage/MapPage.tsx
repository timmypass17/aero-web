import { useEffect, useState } from "react";

import RouteMap from "./components/RouteMap";
import MapResults from "./MapResults/MapResults.tsx";

import type { CyclingRoute } from "../../types/CyclingRoute";

import "./MapPage.css";

function MapPage() {
    const [gpxFile, setGpxFile] =
        useState<File | null>(null);

    const [nearbyRoutes, setNearbyRoutes] =
        useState<CyclingRoute[]>([]);

    const [selectedRouteColor, setSelectedRouteColor] =
        useState("#e66465");

    async function getNearbyRoutes() {
        if (!navigator.geolocation) {
            console.error("Geolocation is not supported");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const {
                    latitude,
                    longitude,
                } = position.coords;

                try {
                    const response = await fetch(
                        `http://localhost:8080/routes?latitude=${latitude}&longitude=${longitude}&radius=20000`,
                        {
                            credentials: "include",
                        }
                    );

                    if (!response.ok) {
                        console.error(
                            "Failed to fetch nearby routes"
                        );
                        return;
                    }

                    const routes = (await response.json()) as CyclingRoute[];

                    setNearbyRoutes(routes);
                } catch (error) {
                    console.error(
                        "Error fetching nearby routes:",
                        error
                    );
                }
            },
            (error) => {
                console.error(
                    "Could not get location:",
                    error
                );
            }
        );
    }

    useEffect(() => {
        getNearbyRoutes();
    }, []);

    return (
        <div className="map-page">

            <MapResults
                nearbyRoutes={nearbyRoutes}
                getNearbyRoutes={getNearbyRoutes}
            />

            <RouteMap
                gpxFile={gpxFile}
                nearbyRoutes={nearbyRoutes}
                selectedRouteColor={
                    selectedRouteColor
                }
            />
        </div>
    );
}

export default MapPage;