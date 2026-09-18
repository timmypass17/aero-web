import { useState } from "react";
import RouteSidebar from "../RouteSidebar/RouteSidebar.tsx";
import type {CyclingRoute} from "../../../types/CyclingRoute.ts";
import MapResultCard from "../components/MapResultCard.tsx";

interface MapResultsProps {
    nearbyRoutes: CyclingRoute[];
}

function MapResults({ nearbyRoutes }: MapResultsProps) {
    const [selectedRoute, setSelectedRoute] =
        useState<CyclingRoute | null>(null);

    const [isClosing, setIsClosing] = useState(false);

    function handleCloseSidebar() {
        setIsClosing(true);

        // setTimeout(() => {
            setSelectedRoute(null);
            setIsClosing(false);
        // }, 200);
    }

    function handleSelectRoute(route: CyclingRoute) {
        setSelectedRoute(route);
        setIsClosing(false);
    }

    return (
        <div className="map-results">
            {!selectedRoute ? (
                <div className="map-results-container">
                    <div className="map-results-header">
                        <h1>Explore Routes</h1>

                        <button className="primary-button">
                            Find nearby
                        </button>
                    </div>

                    {nearbyRoutes.length === 0 ? (
                        <p>No nearby routes found.</p>
                    ) : (
                        <div className="map-results-list">
                            {nearbyRoutes.map((route) => (
                                <MapResultCard
                                    key={route.id}
                                    name={route.name}
                                    difficulty={route.difficulty}
                                    duration={route.duration}
                                    distance={route.distance}
                                    elevationGain={route.elevationGain}
                                    rating={4.5}
                                    rideCount={100}
                                    color={route.color}
                                    onClick={() =>
                                        handleSelectRoute(route)
                                    }
                                />
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <RouteSidebar
                    route={selectedRoute}
                    onClose={handleCloseSidebar}
                    isClosing={isClosing}
                />
            )}
        </div>
    );
}

export default MapResults;