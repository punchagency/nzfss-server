import { Club } from "./club.schema";
import { Ref } from "@typegoose/typegoose";
declare class Dog {
    _id: string;
    name: string;
    pedigreeName: string;
    nzkcNo: string;
    nzfssNo: string;
    dateOfBirth: string;
    breed: string;
    deceased: boolean;
}
export declare class DogInput {
    _id?: string;
    name?: string;
    pedigreeName?: string;
    nzkcNo?: string;
    nzfssNo?: string;
    dob?: string;
    dateOfBirth?: string;
    breed?: string;
    deceased: boolean;
}
export declare class Musher {
    id: string;
    name: string;
    registrationNo?: string;
    kennelRegistrationNo?: string;
    club: Ref<Club>;
    dogs: Dog[];
    showProfileConsent?: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare class CreateMusherInput {
    name: string;
    registrationNo?: string;
    kennelRegistrationNo?: string;
    clubId: string;
    dogs: DogInput[];
    showProfileConsent?: boolean;
}
export declare class UpdateMusherInput {
    name?: string;
    registrationNo?: string;
    kennelRegistrationNo?: string;
    clubId?: string;
    dogs?: DogInput[];
    showProfileConsent?: boolean;
}
export {};
