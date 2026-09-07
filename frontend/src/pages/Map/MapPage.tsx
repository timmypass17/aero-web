import {useEffect, useRef, useState} from "react";
import {
    Map,
    Marker,
    NavigationControl,
    setWorkerUrl,
    GeoJSONSource,
    LngLatBounds,
} from "maplibre-gl";
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import "maplibre-gl/dist/maplibre-gl.css";
import GPXUpload from "../../components/GPXUpload/GPXUpload.tsx";
import "./MapPage.css";
import type {CyclingRoute} from "../../types/CyclingRoute.ts";

setWorkerUrl(workerUrl);

type Coordinate = [number, number];

function MapPage() {
    const uploadedRouteId = "uploadedRouteId";
    const nearbyRouteId = "nearbyRouteId";
    const defaultSelectedColor = "#e66465";

    const mapContainer = useRef<HTMLDivElement>(null);
    const mapRef = useRef<Map | null>(null);

    const [gpxFile, setGpxFile] = useState<File | null>(null);
    const [nearbyRoutes, setNearbyRoutes] = useState<CyclingRoute[]>([]);

    const routeCoordinatesRef = useRef<Coordinate[]>([]);
    const uploadedStartMarkerRef = useRef<Marker | null>(null);
    const nearbyStartMarkersRef = useRef<Marker[]>([]);

    const [selectedRouteColor, setSelectedRouteColor] = useState(defaultSelectedColor);

    // Create a custom start marker
    function createStartMarkerElement(color: string) {
        const element = document.createElement("div");

        element.style.width = "20px";
        element.style.height = "20px";
        element.style.backgroundColor = color;
        element.style.border = "3px solid white";
        element.style.borderRadius = "50%";
        element.style.boxSizing = "border-box";
        element.style.boxShadow = "0 1px 4px rgba(0, 0, 0, 0.4)";

        return element;
    }

    // Parse coordinates from .gpx file and update map to show route
    function handleGpxFile(file: File | null) {
        setGpxFile(file);

        const map = mapRef.current;

        if (!map) {
            console.error("Map is not ready");
            return;
        }

        // If file is null, clear uploaded route
        if (file === null) {
            routeCoordinatesRef.current = [];

            const routeSource = map.getSource(uploadedRouteId) as GeoJSONSource;

            if (routeSource) {
                routeSource.setData({
                    type: "Feature",
                    properties: {},
                    geometry: {
                        type: "LineString",
                        coordinates: [],
                    },
                });
            }

            // Remove uploaded route start marker
            if (uploadedStartMarkerRef.current) {
                uploadedStartMarkerRef.current.remove();
                uploadedStartMarkerRef.current = null;
            }

            return;
        }

        const reader = new FileReader();

        reader.onload = () => {
            const gpxText = reader.result as string;

            const parser = new DOMParser();

            const gpx = parser.parseFromString(
                gpxText,
                "application/xml"
            );

            const trackPoints = gpx.getElementsByTagName("trkpt");

            const coordinates: Coordinate[] = [];

            for (let i = 0; i < trackPoints.length; i++) {
                const point = trackPoints[i];

                const lat = point.getAttribute("lat");
                const lon = point.getAttribute("lon");

                if (lat && lon) {
                    coordinates.push([
                        Number(lon),
                        Number(lat),
                    ]);
                }
            }

            if (coordinates.length === 0) {
                console.error("No coordinates found in GPX file");
                return;
            }

            console.log(
                "GPX coordinates:",
                coordinates
            );

            routeCoordinatesRef.current = coordinates;

            const routeSource = map.getSource(uploadedRouteId) as GeoJSONSource;

            if (!routeSource) {
                console.error("Route source does not exist");
                return;
            }

            // Update uploaded route
            routeSource.setData({
                type: "Feature",
                properties: {},
                geometry: {
                    type: "LineString",
                    coordinates,
                },
            });

            // Uploaded route start marker
            const startCoordinate = coordinates[0];

            // Remove existing marker
            if (uploadedStartMarkerRef.current) {
                uploadedStartMarkerRef.current.remove();
            }

            // Create custom marker element
            const markerElement =
                createStartMarkerElement(
                    selectedRouteColor
                );

            // Create new marker
            uploadedStartMarkerRef.current =
                new Marker({
                    element: markerElement,
                })
                    .setLngLat(startCoordinate)
                    .addTo(map);

            // Fit map to uploaded route
            const bounds = coordinates.reduce(
                (
                    bounds: LngLatBounds,
                    coordinate: Coordinate
                ) => bounds.extend(coordinate),
                new LngLatBounds(
                    coordinates[0],
                    coordinates[0]
                )
            );

            map.fitBounds(bounds, {
                padding: 50,
            });
        };

        reader.readAsText(file);
    }

    // Upload GPX to db
    async function uploadGpx() {
        if (!gpxFile) return;

        const formData = new FormData();

        formData.append("file", gpxFile);
        formData.append("name", gpxFile.name);
        formData.append("color", selectedRouteColor);

        try {
            const response = await fetch(
                "http://localhost:8080/routes",
                {
                    method: "POST",
                    body: formData,
                    credentials: "include",
                }
            );

            if (!response.ok) {
                console.error(
                    "Failed to upload GPX"
                );
                return;
            }

            // Get the newly created route from the backend
            const uploadedRoute = (await response.json()) as CyclingRoute;

            console.log(
                "GPX uploaded successfully:",
                uploadedRoute
            );

            // Add uploaded route to nearby routes locally
            setNearbyRoutes((currentRoutes) => [
                ...currentRoutes,
                uploadedRoute,
            ]);

            // Clear previous uploaded route
            routeCoordinatesRef.current = [];

            const routeSource =
                mapRef.current?.getSource(
                    uploadedRouteId
                ) as GeoJSONSource | undefined;

            if (routeSource) {
                routeSource.setData({
                    type: "Feature",
                    properties: {},
                    geometry: {
                        type: "LineString",
                        coordinates: [],
                    },
                });
            }

            if (uploadedStartMarkerRef.current) {
                uploadedStartMarkerRef.current.remove();
                uploadedStartMarkerRef.current = null;
            }

            setGpxFile(null);
            setSelectedRouteColor(defaultSelectedColor);
        } catch (error) {
            console.error(
                "Error uploading GPX:",
                error
            );
        }
    }

    // Get nearby routes
    async function getNearbyRoutes() {
        if (!navigator.geolocation) {
            console.error(
                "Geolocation is not supported"
            );
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const latitude =
                    position.coords.latitude;

                const longitude =
                    position.coords.longitude;

                const radius = 20000;   // 10000

                console.log(
                    "Current location:",
                    latitude,
                    longitude
                );

                try {
                    const response = await fetch(
                        `http://localhost:8080/routes?latitude=${latitude}&longitude=${longitude}&radius=${radius}`,
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

                    const routes =
                        (await response.json()) as CyclingRoute[];

                    console.log(
                        "Nearby routes:",
                        routes
                    );

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

    // Update nearby routes + start markers
    useEffect(() => {
        const map = mapRef.current;

        if (!map) return;

        const routeSource =
            map.getSource(
                nearbyRouteId
            ) as GeoJSONSource;

        if (!routeSource) return;

        // Update nearby route lines
        routeSource.setData({
            type: "FeatureCollection",
            features: nearbyRoutes.map(
                (route) => ({
                    type: "Feature",
                    properties: {
                        id: route.id,
                        name: route.name,
                        color: route.color
                    },
                    geometry: {
                        type: "LineString",
                        coordinates:
                        route.coordinates,
                    },
                })
            ),
        });

        // Remove old nearby start markers
        nearbyStartMarkersRef.current.forEach(
            (marker) => {
                marker.remove();
            }
        );

        nearbyStartMarkersRef.current = [];

        // Create start marker for every nearby route
        nearbyRoutes.forEach((route) => {
            if (
                !route.coordinates ||
                route.coordinates.length === 0
            ) {
                return;
            }

            const startCoordinate =
                route.coordinates[0] as Coordinate;

            const markerElement =
                createStartMarkerElement(
                    route.color
                );

            const marker = new Marker({
                element: markerElement,
            })
                .setLngLat(startCoordinate)
                .addTo(map);

            nearbyStartMarkersRef.current.push(
                marker
            );
        });
    }, [nearbyRoutes]);

    // Initialize map + controls
    useEffect(() => {
        if (!mapContainer.current) return;

        const map = new Map({
            container: mapContainer.current,
            style:
                "https://tiles.openfreemap.org/styles/liberty", // positron
            center: [-121.8863, 37.3382],
            zoom: 10,
        });

        mapRef.current = map;

        map.addControl(
            new NavigationControl(),
            "top-right"
        );

        map.on("load", () => {
            // Uploaded route source
            map.addSource(uploadedRouteId, {
                type: "geojson",
                data: {
                    type: "Feature",
                    properties: {},
                    geometry: {
                        type: "LineString",
                        coordinates: [],
                    },
                },
            });

            // Uploaded route white outline
            map.addLayer({
                id: "route-line-outline",
                type: "line",
                source: uploadedRouteId,
                layout: {
                    "line-join": "round",
                    "line-cap": "round",
                },
                paint: {
                    "line-color": "#ffffff",
                    "line-width": 10,
                    "line-opacity": 0.9,
                },
            });

            // Uploaded route
            map.addLayer({
                id: "route-line",
                type: "line",
                source: uploadedRouteId,
                layout: {
                    "line-join": "round",
                    "line-cap": "round",
                },
                paint: {
                    "line-color": "#e66465",
                    "line-width": 5,
                },
            });

            // Nearby routes source
            map.addSource(nearbyRouteId, {
                type: "geojson",
                data: {
                    type: "FeatureCollection",
                    features: [],
                },
            });

            // Nearby routes white outline
            map.addLayer({
                id:
                    "nearby-route-lines-outline",
                type: "line",
                source: nearbyRouteId,
                layout: {
                    "line-join": "round",
                    "line-cap": "round",
                },
                paint: {
                    "line-color": "#ffffff",
                    "line-width": 10,
                    "line-opacity": 0.9,
                },
            });

            // Nearby routes
            map.addLayer({
                id: "nearby-route-lines",
                type: "line",
                source: nearbyRouteId,
                layout: {
                    "line-join": "round",
                    "line-cap": "round",
                },
                paint: {
                    "line-color": [
                        "coalesce", // use route's color
                        ["get", "color"],
                        "#0000ff",  // use fallback blue
                    ],
                    "line-width": 4,
                },
            });
        });

        return () => {
            // Remove uploaded start marker
            if (uploadedStartMarkerRef.current) {
                uploadedStartMarkerRef.current.remove();
                uploadedStartMarkerRef.current =
                    null;
            }

            // Remove nearby start markers
            nearbyStartMarkersRef.current.forEach(
                (marker) => {
                    marker.remove();
                }
            );

            nearbyStartMarkersRef.current = [];

            map.remove();
            mapRef.current = null;
        };
    }, []);

    // Update uploaded route color + start marker
    useEffect(() => {
        const map = mapRef.current;

        // Update color
        if (map && map.getLayer("route-line")) {
            map.setPaintProperty(
                "route-line",
                "line-color",
                selectedRouteColor
            );
        }

        const marker = uploadedStartMarkerRef.current;

        // Update marker color
        if (marker) {
            const element = marker.getElement();

            element.style.backgroundColor = selectedRouteColor;
        }
    }, [selectedRouteColor]);

    return (
        <div className="map-page">
            <GPXUpload
                gpxFile={gpxFile}
                setGpxFile={handleGpxFile}
            />

            {gpxFile && (
                <>
                    <div>
                        <input
                            type="color"
                            id="route-color"
                            name="route-color"
                            value={
                                selectedRouteColor
                            }
                            onChange={(e) =>
                                setSelectedRouteColor(
                                    e.target.value
                                )
                            }
                        />

                        <label htmlFor="route-color">
                            Route color
                        </label>
                    </div>

                    <button onClick={uploadGpx}>
                        Upload Route
                    </button>
                </>
            )}

            <button onClick={getNearbyRoutes}>
                Get nearby routes
            </button>

            <div
                className="map-container"
                ref={mapContainer}
            />
        </div>
    );
}

export default MapPage;
