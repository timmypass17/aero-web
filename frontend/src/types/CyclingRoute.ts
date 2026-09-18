export interface CyclingRoute {
    id: string;
    name: string;
    distance: number;
    duration: number;
    elevationGain: number;
    color: string;
    difficulty: string;
    rating: number;
    rideCount: number;
    coordinates: number[][];
    userId: string;
}