export interface CyclingRoute {
    id: string;
    name: string;
    distance: number;
    elevationGain: number;
    userId: string;
    coordinates: [number, number][];
    color: string;
}