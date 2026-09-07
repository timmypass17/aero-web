import "./GPXUpload.css";

interface GPXUploadProps {
    gpxFile: File | null;
    setGpxFile: (file: File | null) => void;
}

function GPXUpload({ gpxFile, setGpxFile}: GPXUploadProps) {
    function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        if (!file) {
            return;
        }
        setGpxFile(file);
        console.log("Selected GPX:", file);
    }
    return <form className="gpx-form">
        <label>
            Upload GPX:
            <input
                type="file"
                accept=".gpx,application/gpx+xml"
                onChange={handleFileChange}
            />
        </label>

        {gpxFile && (
            <p>
                Selected: {gpxFile.name}
            </p>
        )}
    </form>
}

export default GPXUpload;