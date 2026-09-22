export type Coordinate = [number, number];

export function parseGpx(
    gpxText: string
): Coordinate[] {
    const parser = new DOMParser();

    const gpx = parser.parseFromString(
        gpxText,
        "application/xml"
    );

    const trackPoints =
        gpx.getElementsByTagName("trkpt");

    const coordinates: Coordinate[] = [];

    for (let i = 0; i < trackPoints.length; i++) {
        const point = trackPoints[i];

        const lat = point.getAttribute("lat");
        const lon = point.getAttribute("lon");

        if (!lat || !lon) continue;

        coordinates.push([
            Number(lon),
            Number(lat),
        ]);
    }

    return coordinates;
}
