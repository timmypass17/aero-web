import type { CyclingRoute } from "../../../types/CyclingRoute";
import "./RouteSidebar.css";

interface RouteSidebarProps {
    route: CyclingRoute;
    onClose: () => void;
    isClosing: boolean;
}

const METERS_PER_MILE = 1609.344;

function RouteSidebar({
                          route,
                          onClose,
                          isClosing
                      }: RouteSidebarProps) {

    function formatDuration(seconds: number | null): string {
        if (seconds === null) {
            return "N/A";
        }

        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);

        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }

        return `${minutes}m`;
    }

    return (
        <div className={`route-sidebar ${isClosing ? "closing" : ""}`}>
            <div className="route-sidebar-image-wrapper">
                <img
                    className="route-sidebar-image"
                    src={route.thumbnailUrl}
                    alt={route.name}
                />

            </div>

            <div className="route-sidebar-content">
                <button
                    className="route-sidebar-back"
                    onClick={onClose}
                    aria-label="Back to routes"
                >
                    ← <span>Back</span>
                </button>

                <div className="route-sidebar-title">
                    <span
                        className="route-sidebar-color"
                        style={{ backgroundColor: route.color }}
                    />

                    <h2>{route.name}</h2>
                </div>

                <p className="route-sidebar-difficulty">
                    {route.difficulty}
                </p>

                <p className="route-sidebar-description">
                    {route.description}
                </p>

                <div className="route-sidebar-stats">
                    <div>
                        <span className="route-sidebar-label">
                            Duration
                        </span>
                        <span className="route-sidebar-value">
                            {formatDuration(route.duration)}
                        </span>
                    </div>

                    <div>
                        <span className="route-sidebar-label">
                            Distance
                        </span>
                        <span className="route-sidebar-value">
                            {(route.distance / METERS_PER_MILE).toFixed(1)} mi
                        </span>
                    </div>

                    <div>
                        <span className="route-sidebar-label">
                            Elevation
                        </span>
                        <span className="route-sidebar-value">
                            +{Math.round(route.elevationGain)} m
                        </span>
                    </div>
                </div>

                <div className="route-sidebar-meta">
                    <span>★ 4.5</span>
                    <span>100 rides</span>
                </div>

                <p className="route-sidebar-updated">
                    Last updated 2 days ago
                </p>
            </div>
        </div>
    );
}

export default RouteSidebar;