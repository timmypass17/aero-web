import { useEffect, useRef, useState } from "react";
import {
    Map,
    NavigationControl,
    setWorkerUrl,
    GeoJSONSource,
    LngLatBounds,
} from "maplibre-gl";
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import "maplibre-gl/dist/maplibre-gl.css";
import GPXUpload from "../../components/GPXUpload/GPXUpload.tsx";
import "./MapPage.css";

setWorkerUrl(workerUrl);

function MapPage() {
    const mapContainer = useRef<HTMLDivElement>(null);
    const mapRef = useRef<Map | null>(null);

    const [gpxFile, setGpxFile] = useState<File | null>(null);

    function handleGpxFile(file: File | null) {
        setGpxFile(file);

        if (file == null) {
            // Remove the route from the map
            const map = mapRef.current;

            if (map && map.getSource("route")) {
                const source = map.getSource("route") as GeoJSONSource;

                source.setData({
                    type: "Feature",
                    properties: {},
                    geometry: {
                        type: "LineString",
                        coordinates: [],
                    },
                });
            }

            return;
        }

        // Read the GPX file
        const reader = new FileReader();

        // When reader is finished reading, call onload
        reader.onload = () => {
            const gpxText = reader.result as string;

            // Parse GPX XML
            const parser = new DOMParser();
            const gpx = parser.parseFromString(gpxText, "application/xml");

            // Get all track points
            const trackPoints = gpx.getElementsByTagName("trkpt");

            const coordinates: [number, number][] = [];

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

            console.log("GPX coordinates:", coordinates);

            // Update the map
            const map = mapRef.current;

            if (!map) {
                console.error("Map is not ready");
                return;
            }

            const source = map.getSource("route") as GeoJSONSource;

            source.setData({
                type: "Feature",
                properties: {},
                geometry: {
                    type: "LineString",
                    coordinates: coordinates,
                },
            });

            // Creates a bounding box around all of the GPX coordinates
            // - extend() expands the bounding box so that the new coordinate is inside it
            const bounds: LngLatBounds = coordinates.reduce(
                (bounds: LngLatBounds, coordinate: [number, number]): LngLatBounds => bounds.extend(coordinate),
                new LngLatBounds(coordinates[0], coordinates[0])
            );

            // Pan and zoom map to fit bounding box
            map.fitBounds(bounds, {
                padding: 50,
            });
        };

        // Read file as text and put it into reader
        reader.readAsText(file);
    }

    async function uploadGpx() {
        if (!gpxFile) {
            return;
        }

        const formData = new FormData();
        formData.append("file", gpxFile);
        formData.append("name", gpxFile.name);

        const response = await fetch("http://localhost:8080/routes", {
            method: "POST",
            body: formData,
            credentials: "include", // include the user's existing session cookie
        });

        if (!response.ok) {
            console.error("Failed to upload GPX");
            return;
        }

        console.log("GPX uploaded successfully");
    }

    useEffect(() => {
        if (!mapContainer.current) return;

        const map = new Map({
            container: mapContainer.current,
            style: "https://tiles.openfreemap.org/styles/liberty",
            center: [-121.8863, 37.3382],
            zoom: 10,
        });

        // Store map so handleGpxFile can access it
        mapRef.current = map;

        map.addControl(
            new NavigationControl(),
            "top-right"
        );

        map.on("load", () => {
            // Add empty route source
            map.addSource("route", {
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

            // Draw the route
            map.addLayer({
                id: "route-line",
                type: "line",
                source: "route",
                layout: {
                    "line-join": "round",
                    "line-cap": "round",
                },
                paint: {
                    "line-color": "#ff0000",
                    "line-width": 5,
                },
            });
        });

        return () => {
            map.remove();
            mapRef.current = null;
        };
    }, []);

    return (
        <div className="map-page">
            <GPXUpload
                gpxFile={gpxFile}
                setGpxFile={handleGpxFile}
            />

            {gpxFile && (
                <button onClick={uploadGpx}>
                    Upload Route
                </button>
            )}

            <div
                className="map-container"
                ref={mapContainer}
            />
        </div>
    );
}

export default MapPage;