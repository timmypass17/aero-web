import { useState } from "react";

import {
    getNearbyRoutes,
    getRouteGpx,
    type NearbyRoute,
} from "../services/RouteService.ts";

import {
    type Coordinate,
    parseGpx,
} from "../utils/parseGpx.ts";

export type RouteSource = "gpx" | "nearby";

export function usePostRoute() {
    const [routeSource, setRouteSource] =
        useState<RouteSource>("gpx");

    const [gpxFile, setGpxFile] =
        useState<File | null>(null);

    const [selectedRoute, setSelectedRoute] =
        useState<NearbyRoute | null>(null);

    const [coordinates, setCoordinates] =
        useState<Coordinate[]>([]);

    const [nearbyRoutes, setNearbyRoutes] =
        useState<NearbyRoute[]>([]);

    const [loadingNearbyRoutes, setLoadingNearbyRoutes] =
        useState(false);

    const [loadingRoute, setLoadingRoute] =
        useState(false);

    const [error, setError] =
        useState("");

    /*
     * Handle GPX upload.
     */
    async function handleGpxChange(
        event: React.ChangeEvent<HTMLInputElement>
    ) {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        setError("");
        setGpxFile(file);
        setSelectedRoute(null);

        try {
            const gpxText = await file.text();

            const parsedCoordinates =
                parseGpx(gpxText);

            if (parsedCoordinates.length < 2) {
                throw new Error(
                    "The GPX file does not contain enough track points."
                );
            }

            setCoordinates(parsedCoordinates);
        } catch (error) {
            console.error(
                "Failed to parse GPX:",
                error
            );

            setCoordinates([]);
            setGpxFile(null);

            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to read GPX file."
            );
        }
    }

    /*
     * Load nearby routes using browser location.
     */
    function loadNearbyRoutes() {
        setError("");
        setLoadingNearbyRoutes(true);

        if (!navigator.geolocation) {
            setError(
                "Geolocation is not supported by this browser."
            );

            setLoadingNearbyRoutes(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const latitude =
                        position.coords.latitude;

                    const longitude =
                        position.coords.longitude;

                    const routes =
                        await getNearbyRoutes(
                            latitude,
                            longitude,
                            10
                        );

                    setNearbyRoutes(routes);
                } catch (error) {
                    console.error(
                        "Failed to load nearby routes:",
                        error
                    );

                    setError(
                        "Failed to load nearby routes."
                    );
                } finally {
                    setLoadingNearbyRoutes(false);
                }
            },
            (error) => {
                console.error(
                    "Failed to get user location:",
                    error
                );

                setError(
                    "Location permission is required to find nearby routes."
                );

                setLoadingNearbyRoutes(false);
            }
        );
    }

    /*
     * Switch route source.
     */
    function handleRouteSourceChange(
        source: RouteSource
    ) {
        setRouteSource(source);
        setError("");

        setGpxFile(null);
        setSelectedRoute(null);
        setCoordinates([]);

        if (
            source === "nearby" &&
            nearbyRoutes.length === 0
        ) {
            loadNearbyRoutes();
        }
    }

    /*
     * Select a nearby route.
     */
    async function handleNearbyRouteSelect(
        route: NearbyRoute
    ) {
        setError("");
        setLoadingRoute(true);
        setSelectedRoute(route);
        setGpxFile(null);

        try {
            const gpxText =
                await getRouteGpx(route.id);

            const parsedCoordinates =
                parseGpx(gpxText);

            if (parsedCoordinates.length < 2) {
                throw new Error(
                    "The selected route does not contain enough GPS points."
                );
            }

            setCoordinates(parsedCoordinates);
        } catch (error) {
            console.error(
                "Failed to load selected route:",
                error
            );

            setSelectedRoute(null);
            setCoordinates([]);

            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to load route."
            );
        } finally {
            setLoadingRoute(false);
        }
    }

    return {
        routeSource,
        gpxFile,
        selectedRoute,
        coordinates,
        nearbyRoutes,
        loadingNearbyRoutes,
        loadingRoute,
        error,

        handleGpxChange,
        loadNearbyRoutes,
        handleRouteSourceChange,
        handleNearbyRouteSelect,
    };
}