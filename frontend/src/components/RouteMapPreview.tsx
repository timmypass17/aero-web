import { useEffect, useRef } from "react";
import {
    GeoJSONSource,
    LngLatBounds,
    Map,
    NavigationControl,
} from "maplibre-gl";
import type {Coordinate} from "../utils/parseGpx.ts";

type RouteMapPreviewProps = {
    coordinates: Coordinate[];
    routeColor: string;
};

function RouteMapPreview({
    coordinates,
    routeColor,
}: RouteMapPreviewProps) {
    const mapContainerRef =
        useRef<HTMLDivElement | null>(null);

    const mapRef =
        useRef<Map | null>(null);

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
        });

        map.addControl(
            new NavigationControl(),
            "top-right"
        );

        mapRef.current = map;

        return () => {
            map.remove();
            mapRef.current = null;
        };
    }, []);

    /*
     * Update the route whenever coordinates
     * or route color changes.
     */
    useEffect(() => {
        const map = mapRef.current;

        if (!map) {
            return;
        }

        const drawRoute = () => {
            /*
             * Remove the route if there are
             * no coordinates.
             */
            if (coordinates.length === 0) {
                if (map.getLayer("post-route-line")) {
                    map.removeLayer("post-route-line");
                }

                if (map.getSource("post-route")) {
                    map.removeSource("post-route");
                }

                return;
            }

            /*
             * MapLibre only needs longitude/latitude.
             *
             * Our Coordinate is:
             *
             * [longitude, latitude, elevation?]
             *
             * so ignore elevation here.
             */
            const routeCoordinates: [number, number][] =
                coordinates.map(
                    (coordinate) => [
                        coordinate.longitude,
                        coordinate.latitude,
                    ]
                );
            const geoJson = {
                type: "Feature" as const,
                properties: {},
                geometry: {
                    type: "LineString" as const,
                    coordinates: routeCoordinates,
                },
            };

            /*
             * Update existing GeoJSON source.
             */
            const existingSource = map.getSource(
                "post-route"
            ) as GeoJSONSource | undefined;

            if (existingSource) {
                existingSource.setData(geoJson);
            } else {
                /*
                 * Create source.
                 */
                map.addSource("post-route", {
                    type: "geojson",
                    data: geoJson,
                });

                /*
                 * Create route line.
                 */
                map.addLayer({
                    id: "post-route-line",
                    type: "line",
                    source: "post-route",
                    paint: {
                        "line-color": routeColor,
                        "line-width": 5,
                    },
                });
            }

            /*
             * Update color.
             */
            if (map.getLayer("post-route-line")) {
                map.setPaintProperty(
                    "post-route-line",
                    "line-color",
                    routeColor
                );
            }

            /*
             * Zoom map to the route.
             */
            const bounds = new LngLatBounds();

            routeCoordinates.forEach(
                (coordinate) => {
                    bounds.extend(coordinate);
                }
            );

            map.fitBounds(bounds, {
                padding: 50,
                maxZoom: 15,
            });
        };

        /*
         * Map style may not be loaded yet.
         */
        if (map.isStyleLoaded()) {
            drawRoute();
        } else {
            map.once("load", drawRoute);
        }

        /*
         * Clean up the event listener if
         * this effect runs again.
         */
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