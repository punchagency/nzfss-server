export interface EligibilityEntrant {
    class?: string | null;
    customClass?: string | null;
}
export declare const NON_SCORING_CLASS_PATTERN: RegExp;
export declare function isNonScoringClass(entrant?: EligibilityEntrant | null): boolean;
