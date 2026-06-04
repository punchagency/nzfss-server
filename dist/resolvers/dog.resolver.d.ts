export declare class DogResolver {
    dogId(dog: Record<string, unknown>): string | null;
    _id(dog: Record<string, unknown>): string | null;
}
export declare function ensureDogIdsForSave<T extends {
    dogId?: string;
}>(dogs: T[]): Array<T & {
    dogId: string;
}>;
