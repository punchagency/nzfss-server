export type TitleCode = "SD" | "SDX" | "SDCh";
export declare const TITLE_ORDER: TitleCode[];
export declare const TITLE_LABELS: Record<TitleCode, string>;
export interface TitleInputs {
    pointsWithinCutoff: number;
    totalPoints: number;
    positionCredits: number;
}
export declare const SDCH_POSITION_CREDITS = 16;
export declare const SDCH_POINTS = 180;
export declare const SDX_POINTS = 90;
export declare const SD_POINTS = 45;
export declare function positionCreditsFor(positions: {
    first: number;
    second: number;
    third: number;
}): number;
export declare function determineTitle(inputs: TitleInputs): TitleCode | null;
export declare function titleRank(title: TitleCode | null | undefined): number;
export declare function achievedTitlesUpTo(title: TitleCode | null): Record<TitleCode, boolean>;
export interface TitleRecognitionFlags {
    sd: boolean;
    sdx: boolean;
    sdCh: boolean;
}
export declare function emptyRecognitionFlags(): TitleRecognitionFlags;
export declare function recognitionKey(title: TitleCode): keyof TitleRecognitionFlags;
export declare function highestRecognisedTitle(flags: TitleRecognitionFlags | undefined): TitleCode | null;
export declare function isUnrecognisedTitleChange(earnedTitle: TitleCode | null, recognisedTitle: TitleCode | null): boolean;
