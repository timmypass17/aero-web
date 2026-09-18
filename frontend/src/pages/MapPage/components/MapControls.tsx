import GPXUpload from "../../../components/GPXUpload/GPXUpload";
import RouteColorPicker from "./RouteColorPicker";

interface MapControlsProps {
    gpxFile: File | null;
    setGpxFile: (file: File | null) => void;

    selectedRouteColor: string;
    setSelectedRouteColor: (color: string) => void;

    getNearbyRoutes: () => void;
}

function MapControls({
                         gpxFile,
                         setGpxFile,
                         selectedRouteColor,
                         setSelectedRouteColor,
                         getNearbyRoutes,
                     }: MapControlsProps) {

    async function uploadGpx() {
        if (!gpxFile) return;

        const formData = new FormData();

        formData.append("file", gpxFile);
        formData.append("name", gpxFile.name);
        formData.append("color", selectedRouteColor);
        formData.append("difficulty", "easy");

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

            setGpxFile(null);
            setSelectedRouteColor("#e66465");

            // Refresh nearby routes after upload
            getNearbyRoutes();

        } catch (error) {
            console.error(
                "Error uploading GPX:",
                error
            );
        }
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