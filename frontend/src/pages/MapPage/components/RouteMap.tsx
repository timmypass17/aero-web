import {
    useEffect,
    useRef,
    useState,
} from "react";

import {
    Map,
    Marker,
    NavigationControl,
    setWorkerUrl,
    GeoJSONSource,
    LngLatBounds,
} from "maplibre-gl";

import workerUrl from
        "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";

import "maplibre-gl/dist/maplibre-gl.css";

import type { CyclingRoute } from "../../../types/CyclingRoute";

setWorkerUrl(workerUrl);

interface RouteMapProps {
    gpxFile: File | null;
    nearbyRoutes: CyclingRoute[];
    selectedRouteColor: string;
}

type Coordinate = [number, number];

const UPLOADED_ROUTE_ID = "uploadedRouteId";
const NEARBY_ROUTE_ID = "nearbyRouteId";

function createStartMarkerElement(
    color: string
) {
    const element = document.createElement("div");

    element.style.width = "20px";
    element.style.height = "20px";
    element.style.backgroundColor = color;
    element.style.border = "3px solid white";
    element.style.borderRadius = "50%";
    element.style.boxSizing = "border-box";
    element.style.boxShadow =
        "0 1px 4px rgba(0, 0, 0, 0.4)";

    return element;
}

function RouteMap({
                      gpxFile,
                      nearbyRoutes,
                      selectedRouteColor,
                  }: RouteMapProps) {
    const mapContainer =
        useRef<HTMLDivElement>(null);

    const mapRef = useRef<Map | null>(null);

    const uploadedMarkerRef =
        useRef<Marker | null>(null);

    const nearbyMarkersRef =
        useRef<Marker[]>([]);

    // Tells React when the MapLibre sources/layers
    // have actually been created.
    const [mapLoaded, setMapLoaded] =
        useState(false);

    // Initialize map
    useEffect(() => {
        if (!mapContainer.current) return;

        const map = new Map({
            container: mapContainer.current,
            style:
                "https://tiles.openfreemap.org/styles/liberty",
            center: [-121.8863, 37.3382],
            zoom: 10,
        });

        mapRef.current = map;

        map.addControl(
            new NavigationControl(),
            "top-right"
        );

        map.on("load", () => {
            setupRouteLayers(map);

            setMapLoaded(true);
        });

        return () => {
            uploadedMarkerRef.current?.remove();

            nearbyMarkersRef.current.forEach(
                (marker) => marker.remove()
            );

            nearbyMarkersRef.current = [];

            map.remove();
            mapRef.current = null;
        };
    }, []);

    // ----------------------------------------
    // GPX route
    // ----------------------------------------

    useEffect(() => {
        if (!mapLoaded) return;

        const map = mapRef.current;

        if (!map) return;

        // No GPX file = clear uploaded route
        if (!gpxFile) {
            clearUploadedRoute(map);
            return;
        }

        const reader = new FileReader();

        reader.onload = () => {
            const gpxText =
                reader.result as string;

            const parser = new DOMParser();

            const gpx =
                parser.parseFromString(
                    gpxText,
                    "application/xml"
                );

            const trackPoints =
                gpx.getElementsByTagName(
                    "trkpt"
                );

            const coordinates: Coordinate[] = [];

            for (
                let i = 0;
                i < trackPoints.length;
                i++
            ) {
                const point =
                    trackPoints[i];

                const lat =
                    point.getAttribute("lat");

                const lon =
                    point.getAttribute("lon");

                if (!lat || !lon) {
                    continue;
                }

                coordinates.push([
                    Number(lon),
                    Number(lat),
                ]);
            }

            if (coordinates.length === 0) {
                console.error(
                    "No coordinates found in GPX file"
                );
                return;
            }

            console.log(
                "GPX coordinates:",
                coordinates
            );

            // Update route line
            const routeSource =
                map.getSource(
                    UPLOADED_ROUTE_ID
                ) as GeoJSONSource | undefined;

            if (!routeSource) {
                console.error(
                    "Uploaded route source does not exist"
                );
                return;
            }

            routeSource.setData({
                type: "Feature",
                properties: {},
                geometry: {
                    type: "LineString",
                    coordinates,
                },
            });

            // Remove old marker
            uploadedMarkerRef.current?.remove();

            // Add new start marker
            const markerElement =
                createStartMarkerElement(
                    selectedRouteColor
                );

            uploadedMarkerRef.current =
                new Marker({
                    element: markerElement,
                })
                    .setLngLat(coordinates[0])
                    .addTo(map);

            // Fit map to route
            const bounds =
                coordinates.reduce(
                    (
                        bounds: LngLatBounds,
                        coordinate: Coordinate
                    ) =>
                        bounds.extend(
                            coordinate
                        ),
                    new LngLatBounds(
                        coordinates[0],
                        coordinates[0]
                    )
                );

            map.fitBounds(bounds, {
                padding: 50,
            });
        };

        reader.readAsText(gpxFile);

        return () => {
            reader.onload = null;
        };
    }, [
        gpxFile,
        mapLoaded,
        selectedRouteColor,
    ]);

    // ----------------------------------------
    // Nearby routes
    // ----------------------------------------

    useEffect(() => {
        if (!mapLoaded) return;

        const map = mapRef.current;

        if (!map) return;

        const source =
            map.getSource(
                NEARBY_ROUTE_ID
            ) as GeoJSONSource | undefined;

        if (!source) {
            console.error(
                "Nearby route source does not exist"
            );
            return;
        }

        source.setData({
            type: "FeatureCollection",
            features: nearbyRoutes.map(
                (route) => ({
                    type: "Feature",
                    properties: {
                        id: route.id,
                        name: route.name,
                        color: route.color,
                    },
                    geometry: {
                        type: "LineString",
                        coordinates:
                        route.coordinates,
                    },
                })
            ),
        });

        // Remove old markers
        nearbyMarkersRef.current.forEach(
            (marker) => marker.remove()
        );

        nearbyMarkersRef.current = [];

        // Add markers
        nearbyRoutes.forEach((route) => {
            if (!route.coordinates?.length) {
                return;
            }

            const marker =
                new Marker({
                    element:
                        createStartMarkerElement(
                            route.color
                        ),
                })
                    .setLngLat(
                        route.coordinates[0]
                    )
                    .addTo(map);

            nearbyMarkersRef.current.push(
                marker
            );
        });
    }, [
        nearbyRoutes,
        mapLoaded,
    ]);

    // ----------------------------------------
    // Uploaded route color
    // ----------------------------------------

    useEffect(() => {
        if (!mapLoaded) return;

        const map = mapRef.current;

        if (!map) return;

        if (map.getLayer("route-line")) {
            map.setPaintProperty(
                "route-line",
                "line-color",
                selectedRouteColor
            );
        }

        const marker =
            uploadedMarkerRef.current;

        if (marker) {
            marker
                .getElement()
                .style
                .backgroundColor =
                selectedRouteColor;
        }
    }, [
        selectedRouteColor,
        mapLoaded,
    ]);

    return (
        <div
            className="map-container"
            ref={mapContainer}
        />
    );
}

function clearUploadedRoute(map: Map) {
    const source =
        map.getSource(
            UPLOADED_ROUTE_ID
        ) as GeoJSONSource | undefined;

    if (!source) return;

    source.setData({
        type: "Feature",
        properties: {},
        geometry: {
            type: "LineString",
            coordinates: [],
        },
    });
}

function setupRouteLayers(map: Map) {
    // ----------------------------------------
    // Uploaded route
    // ----------------------------------------

    map.addSource(
        UPLOADED_ROUTE_ID,
        {
            type: "geojson",
            data: {
                type: "Feature",
                properties: {},
                geometry: {
                    type: "LineString",
                    coordinates: [],
                },
            },
        }
    );

    map.addLayer({
        id: "route-line-outline",
        type: "line",
        source: UPLOADED_ROUTE_ID,
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

    map.addLayer({
        id: "route-line",
        type: "line",
        source: UPLOADED_ROUTE_ID,
        layout: {
            "line-join": "round",
            "line-cap": "round",
        },
        paint: {
            "line-color": "#e66465",
            "line-width": 5,
        },
    });

    // ----------------------------------------
    // Nearby routes
    // ----------------------------------------

    map.addSource(
        NEARBY_ROUTE_ID,
        {
            type: "geojson",
            data: {
                type: "FeatureCollection",
                features: [],
            },
        }
    );

    map.addLayer({
        id:
            "nearby-route-lines-outline",
        type: "line",
        source: NEARBY_ROUTE_ID,
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

    map.addLayer({
        id: "nearby-route-lines",
        type: "line",
        source: NEARBY_ROUTE_ID,
        layout: {
            "line-join": "round",
            "line-cap": "round",
        },
        paint: {
            "line-color": [
                "coalesce",
                ["get", "color"],
                "#0000ff",
            ],
            "line-width": 4,
        },
    });
}

export default RouteMap;