import { useEffect, useRef, useState } from "react";
import {
    Map,
    NavigationControl,
    GeoJSONSource,
    LngLatBounds,
} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import "./CreateRoutePage.css";
import {createRoute} from "../../services/RouteService.ts";

type Coordinate = {
    latitude: number;
    longitude: number;
};

function CreateRoutePage() {
    const mapContainerRef = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<Map | null>(null);

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [gpxFile, setGpxFile] = useState<File | null>(null);
    const [thumbnail, setThumbnail] = useState<File | null>(null);
    const [coordinates, setCoordinates] = useState<Coordinate[]>([]);
    const [routeColor, setRouteColor] = useState("#e66465");

    /*
     * Initialize MapLibre once when the page loads.
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
     * Draw the GPX route whenever the coordinates or
     * selected color changes.
     */
    useEffect(() => {
        const map = mapRef.current;

        if (!map || coordinates.length === 0) {
            return;
        }

        const drawRoute = () => {
            const routeCoordinates = coordinates.map(
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
             * Update existing source if it already exists.
             */
            const existingSource = map.getSource(
                "new-route"
            ) as GeoJSONSource | undefined;

            if (existingSource) {
                existingSource.setData(geoJson);
            } else {
                map.addSource("new-route", {
                    type: "geojson",
                    data: geoJson,
                });

                map.addLayer({
                    id: "new-route-line",
                    type: "line",
                    source: "new-route",
                    paint: {
                        "line-color": routeColor,
                        "line-width": 5,
                    },
                });
            }

            /*
             * Update route color.
             */
            if (map.getLayer("new-route-line")) {
                map.setPaintProperty(
                    "new-route-line",
                    "line-color",
                    routeColor
                );
            }

            /*
             * Zoom the map to fit the entire route.
             */
            const bounds = new LngLatBounds();

            routeCoordinates.forEach((coordinate) => {
                bounds.extend(
                    coordinate as [number, number]
                );
            });

            map.fitBounds(bounds, {
                padding: 50,
                maxZoom: 15,
            });
        };

        if (map.isStyleLoaded()) {
            drawRoute();
        } else {
            map.once("load", drawRoute);
        }
    }, [coordinates, routeColor]);

    async function handleGpxChange(
        event: React.ChangeEvent<HTMLInputElement>
    ) {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        setGpxFile(file);

        const gpxText = await file.text();

        const parser = new DOMParser();

        const document = parser.parseFromString(
            gpxText,
            "application/xml"
        );

        const trackPoints = Array.from(
            document.getElementsByTagName("trkpt")
        );

        const parsedCoordinates = trackPoints
            .map((point) => {
                const latitude = Number(
                    point.getAttribute("lat")
                );

                const longitude = Number(
                    point.getAttribute("lon")
                );

                return {
                    latitude,
                    longitude,
                };
            })
            .filter(
                (coordinate) =>
                    Number.isFinite(coordinate.latitude) &&
                    Number.isFinite(coordinate.longitude)
            );

        setCoordinates(parsedCoordinates);
    }

    async function handleSubmit(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        if (!gpxFile) {
            return;
        }

        console.log({
            name: name,
            description,
            gpxFile,
            thumbnail,
            routeColor,
            coordinates,
        });
        try {
            const route = await createRoute({
                name: name,
                description,
                gpxFile,
                thumbnail,
                routeColor
            });
            console.log("Route created:", route);
        } catch(error) {
            console.error("Failed to create route:", error);
        }
    }

    return (
        <main className="create-route-page">
            <div className="create-route-container">
                <h1>Create Route</h1>

                <p className="create-route-subtitle">
                    Add a new cycling route to your collection.
                </p>

                <form
                    className="create-route-form"
                    onSubmit={handleSubmit}
                >
                    {/* Title */}
                    <div className="form-group">
                        <label htmlFor="title">
                            Title
                        </label>

                        <input
                            id="title"
                            name="title"
                            type="text"
                            placeholder="e.g. San Jose Loop"
                            value={name}
                            onChange={(event) =>
                                setName(event.target.value)
                            }
                            required
                        />
                    </div>

                    {/* Description */}
                    <div className="form-group">
                        <label htmlFor="description">
                            Description
                        </label>

                        <textarea
                            id="description"
                            name="description"
                            placeholder="Describe your route..."
                            rows={5}
                            value={description}
                            onChange={(event) =>
                                setDescription(event.target.value)
                            }
                        />
                    </div>

                    {/* GPX */}
                    <div className="form-group">
                        <label htmlFor="gpx">
                            GPX File
                        </label>

                        <input
                            id="gpx"
                            name="gpx"
                            type="file"
                            accept=".gpx"
                            onChange={handleGpxChange}
                            required
                        />

                        <span className="form-help">
              Upload a GPX file containing your
              cycling route.
            </span>
                    </div>

                    {/* Map Preview */}
                    <div className="form-group">
                        <label>
                            Route Preview
                        </label>

                        <div
                            ref={mapContainerRef}
                            className="create-route-map"
                        />

                        {coordinates.length > 0 && (
                            <span className="form-help">
                {coordinates.length.toLocaleString()} GPS
                points loaded
              </span>
                        )}
                    </div>

                    {/* Route Color */}
                    <div className="form-group">
                        <label htmlFor="route-color">
                            Route Color
                        </label>

                        <div className="color-picker-container">
                            <input
                                id="route-color"
                                type="color"
                                value={routeColor}
                                onChange={(event) =>
                                    setRouteColor(event.target.value)
                                }
                            />

                            <span>
                {routeColor}
              </span>
                        </div>
                    </div>

                    {/* Thumbnail */}
                    <div className="form-group">
                        <label htmlFor="thumbnail">
                            Thumbnail
                        </label>

                        <input
                            id="thumbnail"
                            name="thumbnail"
                            type="file"
                            accept="image/png, image/jpeg, image/webp"
                            onChange={(event) =>
                                setThumbnail(
                                    event.target.files?.[0] ?? null
                                )
                            }
                        />

                        <span className="form-help">
              Upload an image to use as the route
              thumbnail.
            </span>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        className="create-route-button"
                    >
                        Create Route
                    </button>
                </form>
            </div>
        </main>
    );
}

export default CreateRoutePage;