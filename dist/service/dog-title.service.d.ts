import { type AggPoint, type AggRcrPoint, type DogAggregate, type KeyResolver } from "../utils/dog-points-aggregation";
import { type TitleCode, type TitleRecognitionFlags } from "../utils/dog-titles";
interface RegistryDog {
    musherId: string;
    ownerName: string;
    dogId: string;
    name: string;
    pedigreeName: string;
    nzfssNo: string;
    breed: string;
    flags: TitleRecognitionFlags;
}
export interface DogTitleStatus {
    registryDog: RegistryDog;
    aggregate?: DogAggregate;
    earnedTitle: TitleCode | null;
    recognisedTitle: TitleCode | null;
    isUnrecognised: boolean;
}
export declare function parseTitleFromAwards(awards?: string): TitleCode | null;
export declare function loadRegistryDogs(): Promise<RegistryDog[]>;
export declare function buildKeyResolver(registry: RegistryDog[], points?: AggPoint[], rcrPoints?: AggRcrPoint[]): {
    resolveKey: KeyResolver;
    byCanonical: Map<string, RegistryDog>;
};
export declare function loadAggregationInputs(): Promise<{
    points: AggPoint[];
    rcrPoints: AggRcrPoint[];
}>;
export declare function earnedTitleFor(aggregate?: DogAggregate): TitleCode | null;
export declare function recognisedTitleFor(flags: TitleRecognitionFlags | undefined, aggregate?: DogAggregate): TitleCode | null;
export declare function computeDogTitleStatuses(): Promise<DogTitleStatus[]>;
export interface UnrecognisedChange {
    dogId: string;
    musherId: string;
    dogName: string;
    pedigreeName: string;
    nzfssNo: string;
    ownerName: string;
    breed: string;
    previousTitle: string;
    newTitle: string;
    previousTitleCode: string | null;
    newTitleCode: string;
    points: number;
    events: number;
}
export declare function getUnrecognisedTitleChanges(): Promise<UnrecognisedChange[]>;
export interface RecognisedDog {
    dogId: string;
    musherId: string;
    dogName: string;
    nzfssNo: string;
    ownerName: string;
    previousTitle: string;
    newTitle: string;
}
export declare function recogniseTitleChanges(dogIds: string[]): Promise<RecognisedDog[]>;
export {};
