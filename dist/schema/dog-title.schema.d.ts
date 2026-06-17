export declare class UnrecognisedTitleChange {
    dogId: string;
    musherId: string;
    dogName?: string;
    pedigreeName?: string;
    nzfssNo?: string;
    ownerName?: string;
    breed?: string;
    previousTitle: string;
    newTitle: string;
    previousTitleCode?: string;
    newTitleCode: string;
    points: number;
    events: number;
}
export declare class RecogniseTitleChangesInput {
    dogIds: string[];
}
export declare class RecogniseTitleChangesResponse {
    success: boolean;
    recognisedCount: number;
    message?: string;
}
