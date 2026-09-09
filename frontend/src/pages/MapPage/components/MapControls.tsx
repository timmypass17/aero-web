import GPXUpload from "../../../components/GPXUpload/GPXUpload";
import RouteColorPicker from "./RouteColorPicker";
import type { CyclingRoute } from "../../../types/CyclingRoute";

interface MapControlsProps {
    gpxFile: File | null;
    setGpxFile: (file: File | null) => void;

    selectedRouteColor: string;
    setSelectedRouteColor: (color: string) => void;

    onNearbyRoutes: Dispatch<SetStateAction<CyclingRoute[]>>;
}

function MapControls({
                         gpxFile,
                         setGpxFile,
                         selectedRouteColor,
                         setSelectedRouteColor,
                         onNearbyRoutes,
                     }: MapControlsProps) {
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
                console.error("Failed to upload GPX");
                return;
            }

            const uploadedRoute =
                (await response.json()) as CyclingRoute;

            onNearbyRoutes((currentRoutes) => [
                ...currentRoutes,
                uploadedRoute,
            ]);

            setGpxFile(null);
            setSelectedRouteColor("#e66465");
        } catch (error) {
            console.error(
                "Error uploading GPX:",
                error
            );
        }
    }

    async function getNearbyRoutes() {
        if (!navigator.geolocation) {
            console.error(
                "Geolocation is not supported"
            );
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const {
                    latitude,
                    longitude,
                } = position.coords;

                try {
                    const response = await fetch(
                        `http://localhost:8080/routes?latitude=${latitude}&longitude=${longitude}&radius=20000`,
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

                    onNearbyRoutes(routes);
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

    return (
        <>
            <GPXUpload
                gpxFile={gpxFile}
                setGpxFile={setGpxFile}
            />

            {gpxFile && (
                <>
                    <RouteColorPicker
                        color={selectedRouteColor}
                        onChange={setSelectedRouteColor}
                    />

                    <button onClick={uploadGpx}>
                        Upload Route
                    </button>
                </>
            )}

            <button onClick={getNearbyRoutes}>
                Get nearby routes
            </button>
        </>
    );
}

export default MapControls;
