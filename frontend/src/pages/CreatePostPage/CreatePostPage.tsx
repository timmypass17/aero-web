import {useRef, useState} from "react";
import "maplibre-gl/dist/maplibre-gl.css";
import "./CreatePostPage.css";
import { createPost } from "../../services/PostService.ts";
import {
    calculateDistance, calculateDuration,
    calculateElevationGain,
} from "../../utils/parseGpx.ts";
import RouteMapPreview from "../../components/RouteMapPreview.tsx";
import { usePostRoute } from "../../hooks/usePostRoute.ts";
import formatDuration from "../../utils/formatDuration.ts";
import {LngLatBounds, Map} from "maplibre-gl";

const DEFAULT_ROUTE_COLOR = "#e66465";

function CreatePostPage() {
    const [content, setContent] =
        useState("");

    const [routeColor, setRouteColor] =
        useState(DEFAULT_ROUTE_COLOR);

    const [startDateTime, setStartDateTime] =
        useState("");

    const [endDateTime, setEndDateTime] =
        useState("");

    const [formError, setFormError] =
        useState("");

    const mapRef =
        useRef<Map | null>(null);

    // Extract route-related state to custom hook so CreatePostPage can focus on form submission
    const {
        routeSource,
        gpxFile,
        selectedRoute,
        coordinates,
        nearbyRoutes,
        loadingNearbyRoutes,
        loadingRoute,
        error: routeError,
        handleGpxChange,
        loadNearbyRoutes,
        handleRouteSourceChange,
        handleNearbyRouteSelect,
    } = usePostRoute();

    const distanceMeters = coordinates.length < 2 ? 0 : calculateDistance(coordinates);
    const elevationGainMeters = coordinates.length < 2 ? 0 : calculateElevationGain(coordinates);
    const durationSeconds = calculateDuration(startDateTime, endDateTime);

    /*
     * Create post.
     */
    async function handleSubmit(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        setFormError("");

        if (!content.trim()) {
            setFormError("Post content is required.");
            return;
        }

        if (coordinates.length < 2) {
            setFormError("Please select or upload a route.");
            return;
        }

        if (!startDateTime || !endDateTime) {
            setFormError("Start and end date/time are required.");
            return;
        }

        if (new Date(endDateTime) <= new Date(startDateTime)) {
            setFormError("End date/time must be after start date/time.");
            return;
        }

        // Generate image
        if (coordinates.length < 2) {
            return;
        }

        const routeCoordinates: [number, number][] =
            coordinates.map((coordinate) => [
                coordinate.longitude,
                coordinate.latitude,
            ]);

        const bounds = new LngLatBounds();

        routeCoordinates.forEach((coordinate) => {
            bounds.extend(coordinate);
        });

        const map = mapRef.current;

        if (!map) {
            return;
        }

        // Make sure the canvas matches the container size.
        map.resize();

        map.fitBounds(bounds, {
            padding: 50,
            maxZoom: 15,
            duration: 0,
        });

        // Wait until MapLibre has finished rendering after panning
        map.once("idle", () => {
            const canvas = map.getCanvas();

            canvas.toBlob(async (blob) => {
                if (!blob) {
                    return;
                }

                try {
                    const post = await createPost({
                        content: content.trim(),
                        routeId: selectedRoute?.id,
                        gpxFile: routeSource === "gpx" ? gpxFile : null,
                        startDateTime,
                        endDateTime,
                        routeColor,
                        routeThumbnail: blob
                    });

                    console.log(
                        "Post created:",
                        post
                    );

                    // TODO: Add naviation after sucess creation
                } catch (error) {
                    console.error("Failed to create post:", error);
                    setFormError("Failed to create post.");
                }
            }, "image/png");

            // const image =
            //     canvas.toDataURL("image/png");
            //
            // console.log(image);
        });
    }

    return (
        <main className="create-post-page">
            <div className="create-post-container">
                <h1>Create Post</h1>

                <p className="create-post-subtitle">
                    <>Share a cycling activity with the community.</>
                </p>

                <form
                    className="create-post-form"
                    onSubmit={handleSubmit}
                >
                    {/* Content */}
                    <div className="form-group">
                        <label htmlFor="content">
                            Content
                        </label>

                        <textarea
                            id="content"
                            name="content"
                            placeholder="How was your ride?"
                            rows={6}
                            value={content}
                            onChange={(event) =>
                                setContent(event.target.value)
                            }
                            required
                        />
                    </div>

                    {/* Route Source */}
                    <div className="form-group">
                        <label>Route</label>

                        <div className="route-source-options">
                            <label className="route-source-option">
                                <input
                                    type="radio"
                                    name="route-source"
                                    value="gpx"
                                    checked={routeSource === "gpx"}
                                    onChange={() =>
                                        handleRouteSourceChange("gpx")
                                    }
                                />

                                <span>Upload GPX</span>
                            </label>

                            <label className="route-source-option">
                                <input
                                    type="radio"
                                    name="route-source"
                                    value="nearby"
                                    checked={routeSource === "nearby"}
                                    onChange={() =>
                                        handleRouteSourceChange("nearby")
                                    }
                                />

                                <span>Nearby Routes</span>
                            </label>
                        </div>
                    </div>

                    {/* GPX Upload */}
                    {routeSource === "gpx" && (
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
                            />

                            <span className="form-help">
                                Upload a GPX file containing your cycling route.
                            </span>
                        </div>
                    )}

                    {/* Nearby Routes */}
                    {routeSource === "nearby" && (
                        <div className="form-group">
                            <div className="nearby-routes-header">
                                <label>Nearby Routes</label>

                                <button
                                    type="button"
                                    className="refresh-routes-button"
                                    onClick={loadNearbyRoutes}
                                    disabled={loadingNearbyRoutes}
                                >
                                    {loadingNearbyRoutes
                                        ? "Loading..."
                                        : "Refresh"}
                                </button>
                            </div>

                            {nearbyRoutes.length === 0 &&
                                !loadingNearbyRoutes && (
                                    <div className="nearby-routes-empty">
                                        No nearby routes found.
                                    </div>
                                )}

                            <div className="nearby-routes-list">
                                {nearbyRoutes.map((route) => (
                                    <button
                                        type="button"
                                        key={route.id}
                                        className={`nearby-route-card ${
                                            selectedRoute?.id === route.id
                                                ? "selected"
                                                : ""
                                        }`}
                                        onClick={() =>
                                            handleNearbyRouteSelect(route)
                                        }
                                    >
                                    <span className="nearby-route-name">
                                        {route.name}
                                    </span>

                                        {route.description && (
                                            <span className="nearby-route-description">
                                            {route.description}
                                        </span>
                                        )}
                                    </button>
                                ))}
                            </div>

                            {loadingRoute && (
                                <span className="form-help">
                                Loading route...
                            </span>
                            )}
                        </div>
                    )}

                    {/* Map Preview */}
                    <RouteMapPreview
                        coordinates={coordinates}
                        routeColor={routeColor}
                        mapRef={mapRef}
                    />

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

                            <span>{routeColor}</span>
                        </div>

                        <span className="form-help">
                        Choose the color used to display this route on the post.
                    </span>
                    </div>

                    {/* Start Date/Time */}
                    <div className="form-group">
                        <label htmlFor="start-date-time">
                            Start Date & Time
                        </label>

                        <input
                            id="start-date-time"
                            name="start-date-time"
                            type="datetime-local"
                            value={startDateTime}
                            onChange={(event) =>
                                setStartDateTime(event.target.value)
                            }
                            required
                        />
                    </div>

                    {/* End Date/Time */}
                    <div className="form-group">
                        <label htmlFor="end-date-time">
                            End Date & Time
                        </label>

                        <input
                            id="end-date-time"
                            name="end-date-time"
                            type="datetime-local"
                            value={endDateTime}
                            onChange={(event) =>
                                setEndDateTime(event.target.value)
                            }
                            required
                        />
                    </div>

                    {/* Route Stats */}
                    <div className="form-group">
                        <label>Route Stats</label>

                        <div className="route-stats">
                            <div className="route-stat">
                            <span className="route-stat-label">
                                Distance
                            </span>

                                <span className="route-stat-value">
                                {distanceMeters > 0
                                    ? `${(distanceMeters / 1000).toFixed(2)} km`
                                    : "—"}
                            </span>
                            </div>

                            <div className="route-stat">
                            <span className="route-stat-label">
                                Elevation
                            </span>

                                <span className="route-stat-value">
                                {elevationGainMeters > 0
                                    ? `${Math.round(
                                        elevationGainMeters
                                    ).toLocaleString()} m`
                                    : "—"}
                            </span>
                            </div>

                            <div className="route-stat">
                            <span className="route-stat-label">
                                Duration
                            </span>

                                <span className="route-stat-value">
                                {formatDuration(durationSeconds)}
                            </span>
                            </div>
                        </div>

                        <span className="form-help">
                        Distance and elevation are calculated from the GPX
                        track. Duration is calculated from the start and end
                        times.
                    </span>
                    </div>

                    {/* Route Error */}
                    {routeError && (
                        <div className="create-post-error">
                            {routeError}
                        </div>
                    )}

                    {/* Form Error */}
                    {formError && (
                        <div className="create-post-error">
                            {formError}
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        className="create-post-button"
                    >
                        Create Post
                    </button>
                </form>
            </div>
        </main>
    );
}

export default CreatePostPage;