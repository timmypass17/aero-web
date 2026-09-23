export type Coordinate = {
    latitude: number;
    longitude: number;
    elevation?: number;
};

const EARTH_RADIUS_METERS = 6_371_000;

export function parseGpx(gpxText: string): Coordinate[] {
    const parser = new DOMParser();

    const document = parser.parseFromString(
        gpxText,
        "application/xml"
    );

    if (document.querySelector("parsererror")) {
        throw new Error("Invalid GPX file.");
    }

    const trackPoints = Array.from(
        document.getElementsByTagName("trkpt")
    );

    return trackPoints
        .map((point) => {
            const latitude = Number(
                point.getAttribute("lat")
            );

            const longitude = Number(
                point.getAttribute("lon")
            );

            const elevationElement =
                point.getElementsByTagName("ele")[0];

            const elevation = elevationElement
                ? Number(elevationElement.textContent)
                : undefined;

            return {
                latitude,
                longitude,
                elevation,
            };
        })
        .filter(
            (coordinate) =>
                Number.isFinite(
                    coordinate.latitude
                ) &&
                Number.isFinite(
                    coordinate.longitude
                )
        );
}

/*
 * Calculate total distance using Haversine.
 *
 * Returns meters.
 */
export function calculateDistance(
    coordinates: Coordinate[]
): number {
    let totalDistance = 0;

    for (let i = 1; i < coordinates.length; i++) {
        const previous = coordinates[i - 1];
        const current = coordinates[i];

        const lat1 =
            (previous.latitude * Math.PI) / 180;

        const lat2 =
            (current.latitude * Math.PI) / 180;

        const deltaLat =
            ((current.latitude -
                    previous.latitude) *
                Math.PI) /
            180;

        const deltaLon =
            ((current.longitude -
                    previous.longitude) *
                Math.PI) /
            180;

        const a =
            Math.sin(deltaLat / 2) ** 2 +
            Math.cos(lat1) *
            Math.cos(lat2) *
            Math.sin(deltaLon / 2) ** 2;

        const c =
            2 *
            Math.atan2(
                Math.sqrt(a),
                Math.sqrt(1 - a)
            );

        totalDistance +=
            EARTH_RADIUS_METERS * c;
    }

    return totalDistance;
}

/*
 * Calculate positive elevation gain.
 *
 * Returns meters.
 */
export function calculateElevationGain(
    coordinates: Coordinate[]
): number {
    let elevationGain = 0;

    for (let i = 1; i < coordinates.length; i++) {
        const previousElevation =
            coordinates[i - 1].elevation;

        const currentElevation =
            coordinates[i].elevation;

        if (
            previousElevation === undefined ||
            currentElevation === undefined
        ) {
            continue;
        }

        const difference =
            currentElevation - previousElevation;

        if (difference > 0) {
            elevationGain += difference;
        }
    }

    return elevationGain;
}

export function calculateDuration(
    startDateTime: string,
    endDateTime: string
): number {
    if (!startDateTime || !endDateTime) {
        return 0;
    }

    const start =
        new Date(startDateTime).getTime();

    const end =
        new Date(endDateTime).getTime();

    if (
        !Number.isFinite(start) ||
        !Number.isFinite(end)
    ) {
        return 0;
    }

    if (end <= start) {
        return 0;
    }

    return Math.floor(
        (end - start) / 1000
    );
}