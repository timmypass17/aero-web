import { useEffect, useRef } from "react";
import {
    GeoJSONSource,
    LngLatBounds,
    Map,
    NavigationControl,
} from "maplibre-gl";

import "maplibre-gl/dist/maplibre-gl.css";

import type { Coordinate } from "../utils/parseGpx.ts";

type RouteMapPreviewProps = {
    coordinates: Coordinate[];
    routeColor: string;
    mapRef: {
        current: Map | null;
    };
};

function RouteMapPreview({coordinates, routeColor, mapRef}: RouteMapPreviewProps) {
    const mapContainerRef =
        useRef<HTMLDivElement | null>(null);

    /*
     * Initialize MapLibre once.
     */
    useEffect(() => {
        if (!mapContainerRef.current) {
            return;
        }

        const map = new Map({
            container: mapContainerRef.current,
            style: "https://tiles.openfreemap.org/styles/liberty",
            center: [-121.8863, 37.3382],
            zoom: 10,
            canvasContextAttributes: {
                preserveDrawingBuffer: true,
            },
        });

        map.addControl(
            new NavigationControl(),
            "top-right"
        );

        mapRef.current = map;

        /*
         * Cleanup.
         */
        return () => {
            map.remove();
            mapRef.current = null;
        };
    }, []);

    /*
     * Update route whenever coordinates
     * or route color changes.
     */
    useEffect(() => {
        const map = mapRef.current;

        if (!map) {
            return;
        }

        const drawRoute = () => {
            // Remove route if there are no coordinates.
            // Source = the data (i.e. cycling routes)
            // Layer = how the data is displayed (i.e. line, marker, colors)
            if (coordinates.length === 0) {
                if (map.getLayer("post-route-start")) {
                    map.removeLayer("post-route-start");
                }

                if (map.getSource("post-route-start")) {
                    map.removeSource("post-route-start");
                }

                if (map.getLayer("post-route-line")) {
                    map.removeLayer("post-route-line");
                }

                if (map.getLayer("route-line-outline")) {
                    map.removeLayer("route-line-outline");
                }

                if (map.getSource("post-route")) {
                    map.removeSource("post-route");
                }

                return;
            }

            const routeCoordinates: [number, number][] =
                coordinates.map((coordinate) => [
                    coordinate.longitude,
                    coordinate.latitude,
                ]);

            // Route GeoJSON. (Represents cycling route)
            const geoJson = {
                type: "Feature" as const,   // Feature = represents some geographic thing (e.g. point, linestring, polygon)
                properties: {},  // store extra info about feature if needed
                geometry: { // geographic shape
                    type: "LineString" as const,    // LineString = connect coordinates together to form a line
                    coordinates: routeCoordinates,
                },
            };

            // Start point GeoJSON.
            const startPoint = {
                type: "Feature" as const,
                properties: {},
                geometry: {
                    type: "Point" as const,
                    coordinates: routeCoordinates[0],   // just use first coordinate as start
                },
            };

            // Route source (the geographic
            const existingRouteSource = map.getSource("post-route") as | GeoJSONSource | undefined;

            if (existingRouteSource) {
                // Update existing source
                existingRouteSource.setData(geoJson);
            } else {
                // No source yet, create one
                map.addSource("post-route", {
                    type: "geojson",
                    data: geoJson,
                });

                // White route outline.
                map.addLayer({
                    id: "route-line-outline",
                    type: "line",
                    source: "post-route",   // take data from post-route and draw it as a line
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

                // Colored route line.
                map.addLayer({
                    id: "post-route-line",
                    type: "line",
                    source: "post-route",
                    layout: {
                        "line-join": "round",
                        "line-cap": "round",
                    },
                    paint: {    // inital color
                        "line-color": routeColor,
                        "line-width": 5,
                    },
                });
            }

            // Start point source
            const existingStartSource = map.getSource("post-route-start") as | GeoJSONSource | undefined;

            if (existingStartSource) {
                existingStartSource.setData(startPoint);
            } else {
                map.addSource("post-route-start", {
                    type: "geojson",
                    data: startPoint,
                });

                // Start marker.
                map.addLayer({
                    id: "post-route-start",
                    type: "circle",
                    source: "post-route-start",
                    paint: {
                        "circle-radius": 10,
                        "circle-color": routeColor,
                        "circle-stroke-color": "#ffffff",
                        "circle-stroke-width": 3,
                    },
                });
            }

            // Update existing layer if user changes route color
            if (map.getLayer("post-route-line")) {
                map.setPaintProperty(
                    "post-route-line",
                    "line-color",
                    routeColor
                );
            }

            if (map.getLayer("post-route-start")) {
                map.setPaintProperty(
                    "post-route-start",
                    "circle-color",
                    routeColor
                );
            }

            // Fit map to route
            const bounds = new LngLatBounds();

            routeCoordinates.forEach((coordinate) => {
                bounds.extend(coordinate);
            });

            map.fitBounds(bounds, {
                padding: 50,
                maxZoom: 15,
            });
        };

        // Wait until the map style is loaded.
        if (map.isStyleLoaded()) {
            drawRoute();
        } else {
            // load = When map finishes loading
            map.once("load", drawRoute);
        }

        // Remove load listener if effect runs again.
        return () => {
            map.off("load", drawRoute);
        };
    }, [coordinates, routeColor]);

    return (
        <div className="form-group">
            <label>
                Route Preview
            </label>

            <div
                ref={mapContainerRef}
                className="create-post-map"
            />

            {coordinates.length > 0 && (
                <span className="form-help">
                    {coordinates.length.toLocaleString()}{" "}
                    GPS points loaded
                </span>
            )}
        </div>
    );
}

export default RouteMapPreview;