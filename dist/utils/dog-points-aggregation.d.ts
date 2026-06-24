export interface DogSnapshot {
    dogId?: string;
    name?: string;
    NZFSSRegistration?: string;
    breed?: string;
    driverName?: string;
}
export interface AggEntrant {
    raceTime?: string | null;
    class?: string;
    customClass?: string;
    eventId?: string;
    raceType?: string;
    associatedDog: DogSnapshot[];
}
export interface AggDogPoint {
    dogId?: string;
    NZFSSRegistration?: string;
    points: number;
    cutoffPoints?: number;
}
export interface AggPoint {
    points: number;
    cutoffTime?: string | null;
    dogPoints?: AggDogPoint[];
    entrant?: AggEntrant | null;
}
export interface AggRcrPoint {
    dogId?: string;
    rcrReg?: string;
    rcrFlag?: string;
    rcrPedigreeName?: string;
    rcrBreed?: string;
    rcrPoints?: number;
    rcrEvents?: number;
    rcrAwards?: string;
    rcrCutoff?: string;
}
export interface DogAggregate {
    key: string;
    dogId?: string;
    petName: string;
    displayName: string;
    kennelReg: string;
    breed?: string;
    pointsWithinCutoff: number;
    pointsOutsideCutoff: number;
    events: number;
    positions: {
        first: number;
        second: number;
        third: number;
    };
    historicalAwards: string;
}
export declare function parseRegistration(reg?: string | null): {
    kennelReg: string;
    petNameFromReg?: string;
};
export declare function normalizeKennelReg(reg?: string | null): string;
export declare function extractPetName(name?: string | null, registration?: string | null): string;
export declare function getDogMergeKey(params: {
    dogId?: string | null;
    name?: string | null;
    registration?: string | null;
}): string;
export declare function findAmbiguousRcrDogIds(rcrPoints: AggRcrPoint[]): Set<string>;
export declare function getRcrMergeKey(rcr: AggRcrPoint, ambiguousDogIds: Set<string>): string;
export declare function getLiveDogMergeKey(dog: DogSnapshot, ambiguousDogIds: Set<string>): string;
export declare function timeToSeconds(timeStr?: string | null): number;
export type KeyResolver = (mergeKey: string) => string | undefined;
export declare function aggregateDogPoints(points: AggPoint[], rcrPoints: AggRcrPoint[], resolveKey?: KeyResolver): Map<string, DogAggregate>;
