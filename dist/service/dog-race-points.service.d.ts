export interface DogRacePointSummary {
    name: string;
    regNumber: string;
    breed: string;
    pointsWithinCutoff: number;
    pointsOutsideCutoff: number;
    events: number;
    avgCutoffSeconds: number | null;
    awards: string;
}
export declare function computeDogRacePointSummaries(): Promise<DogRacePointSummary[]>;
