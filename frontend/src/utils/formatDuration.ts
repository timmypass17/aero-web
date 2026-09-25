export default function formatDuration(seconds: number): string {
    if (seconds <= 0) {
        return "—";
    }

    const hours = Math.floor(seconds / 3600);

    const minutes = Math.floor((seconds % 3600) / 60);

    return `${hours}h ${minutes
        .toString()
        .padStart(2, "0")}m`;
}