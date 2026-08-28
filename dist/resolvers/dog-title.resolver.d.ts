import { UnrecognisedTitleChange, RecogniseTitleChangesInput, RecogniseTitleChangesResponse } from "../schema/dog-title.schema";
import Context from "../types/context";
export declare class DogTitleResolver {
    private logService;
    getUnrecognisedTitleChanges(): Promise<UnrecognisedTitleChange[]>;
    recogniseTitleChanges(input: RecogniseTitleChangesInput, context: Context): Promise<RecogniseTitleChangesResponse>;
}
