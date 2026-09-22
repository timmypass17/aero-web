import sample from '../../../assets/sample-bg.png';

interface MapResultCardProps {
    name: string;
    difficulty: string;
    duration: number;
    distance: number;
    elevationGain: number;
    rating: number;
    rideCount: number;
    color: string;
    onClick: () => void;
    thumbnailUrl: string;
}

const METERS_PER_MILE = 1609.344;

function MapResultCard({
                           name,
                           difficulty,
                           duration,
                           distance,
                           elevationGain,
                           rating,
                           rideCount,
                           color,
                           onClick,
                           thumbnailUrl
                       }: MapResultCardProps) {
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
        <div
            className="map-result-card"
            onClick={onClick}
            role="button"
            tabIndex={0}
        >
            <img
                className="map-result-image"
                src={thumbnailUrl}
                alt={name}
            />

            <div className="map-result-content">
                <div className="map-result-header">
                    <h2>{name}</h2>
                </div>

                <div className="map-result-stats">
                    <p>{formatDuration(duration)}</p>
                    <p>{(distance / METERS_PER_MILE).toFixed(1)} mi</p>
                    <p>+{Math.round(elevationGain)} m</p>
                </div>

                <div className="map-result-meta">
                    <span>★ {rating}</span>
                    <span>{rideCount} rides</span>
                </div>
            </div>

            <span
                className="route-color"
                style={{ backgroundColor: color }}
            />
        </div>
    );
}

export default MapResultCard;