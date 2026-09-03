export interface ScoringDogLike {
    name?: string | null;
    NZFSSRegistration?: string | null;
    dogId?: string | null;
}
export interface ScoringSnapshot {
    name?: string | null;
    class?: string | null;
    customClass?: string | null;
    heat?: string | null;
    raceTime?: string | null;
    raceType?: string | null;
    raceFormat?: string | null;
    weightPulled?: string | null;
    dogWeight?: string | null;
    associatedDog?: ScoringDogLike[] | null;
}
export interface SiblingIdentity {
    name: string;
    class: string;
    customClass: string;
}
export declare function dogTeamSignature(dogs?: ScoringDogLike[] | null): string;
export declare function scoringFieldsChanged(before: ScoringSnapshot, after: ScoringSnapshot): boolean;
export declare function scoringSiblingIdentities(before: SiblingIdentity, after?: Partial<SiblingIdentity>): SiblingIdentity[];
