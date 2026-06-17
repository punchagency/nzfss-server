import { UnrecognisedTitleChange, RecogniseTitleChangesInput, RecogniseTitleChangesResponse } from "../schema/dog-title.schema";
export declare class DogTitleResolver {
    getUnrecognisedTitleChanges(): Promise<UnrecognisedTitleChange[]>;
    recogniseTitleChanges(input: RecogniseTitleChangesInput): Promise<RecogniseTitleChangesResponse>;
}
