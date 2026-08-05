import { type AggPoint, type AggRcrPoint, type KeyResolver } from "../utils/dog-points-aggregation";
export interface DogRacePointSummary {
    name: string;
    regNumber: string;
    breed: string;
    pointsWithinCutoff: number;
    pointsOutsideCutoff: number;
    events: number;
    cutoffPoints: number;
    awards: string;
}
export declare function parseRcrCutoffPoints(rcrCutoff?: string | number | null): number;
export declare function applyCutoffTracking(points: AggPoint[], rcrPoints: AggRcrPoint[], resolveKey: KeyResolver, cutoffByKey: Map<string, number>): void;
export declare function getCutoffPointsForKey(cutoffByKey: Map<string, number>, key: string): number;
export declare function computeDogRacePointSummaries(): Promise<DogRacePointSummary[]>;
export declare function invalidateDogRacePointSummaries(): void;
