export interface ProcessedMusherDog {
    dogId: string;
    name: string;
    pedigreeName: string;
    nzkcNo: string;
    nzfssNo: string;
    dateOfBirth: string;
    breed: string;
    deceased: boolean;
}
export interface MusherDogInputFields {
    _id?: string;
    dogId?: string;
    name?: string;
    pedigreeName?: string;
    nzkcNo?: string;
    nzfssNo?: string;
    dob?: string;
    dateOfBirth?: string;
    breed?: string;
    deceased?: boolean;
}
export interface ExistingMusherDogFields extends MusherDogInputFields {
    dogId?: string;
}
export declare function processDogsForCreate(dogs: MusherDogInputFields[]): ProcessedMusherDog[];
export declare function processDogsForUpdate(inputDogs: MusherDogInputFields[], existingDogs?: ExistingMusherDogFields[]): ProcessedMusherDog[];
export declare function ensureDogIdsOnStoredDogs(dogs: ExistingMusherDogFields[]): ProcessedMusherDog[];
