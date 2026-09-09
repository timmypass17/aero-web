import { useState } from "react";

import MapControls from "./components/MapControls";
import MapSearch from "./components/MapSearch";
import RouteMap from "./components/RouteMap";

import type { CyclingRoute } from "../../types/CyclingRoute";

import "./MapPage.css";

function MapPage() {
    const [gpxFile, setGpxFile] =
        useState<File | null>(null);

    const [nearbyRoutes, setNearbyRoutes] =
        useState<CyclingRoute[]>([]);

    const [selectedRouteColor, setSelectedRouteColor] =
        useState("#e66465");

    const [searchRadius, setSearchRadius] =
        useState(10);

    return (
        <div className="map-page">
            <div className="map-controls">

                <MapSearch
                    searchRadius={searchRadius}
                    setSearchRadius={setSearchRadius}
                    onSearch={() => {
                        // TODO
                    }}
                />

                <MapControls
                    gpxFile={gpxFile}
                    setGpxFile={setGpxFile}
                    selectedRouteColor={selectedRouteColor}
                    setSelectedRouteColor={
                        setSelectedRouteColor
                    }
                    onNearbyRoutes={
                        setNearbyRoutes
                    }
                />

            </div>

            <RouteMap
                gpxFile={gpxFile}
                nearbyRoutes={nearbyRoutes}
                selectedRouteColor={
                    selectedRouteColor
                }
            />
        </div>
    );
}

export default MapPage;