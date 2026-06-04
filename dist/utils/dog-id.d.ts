export declare const DOG_ID_REGEX: RegExp;
export declare function generateDogId(): string;
export declare function isValidDogId(id: string | undefined | null): id is string;
export interface DogIdInput {
    _id?: string;
    dogId?: string;
}
export interface ExistingDogRef {
    dogId?: string;
}
export declare function resolveDogId(input: DogIdInput, existing?: ExistingDogRef): string;
export interface DogLookupFields {
    dogId?: string;
    name?: string;
    nzfssNo?: string;
    nzfssNumber?: string;
    petName?: string;
}
export declare function buildDogLookup<T extends DogLookupFields>(dogs: T[]): {
    byDogId: Map<string, T>;
    byNzfss: Map<string, T>;
    byName: Map<string, T>;
};
export declare function findExistingDog<T extends DogLookupFields>(input: {
    _id?: string;
    dogId?: string;
    name?: string;
    nzfssNo?: string;
    nzfssNumber?: string;
    petName?: string;
}, lookup: ReturnType<typeof buildDogLookup<T>>): T | undefined;
export declare function assertUniqueDogIds(dogs: Array<{
    dogId?: string;
}>, context: string): void;
