import { Club } from "./club.schema";
import { Ref } from "@typegoose/typegoose";
export declare class Dog {
    dogId?: string;
    _id?: string;
    name: string;
    pedigreeName: string;
    nzkcNo: string;
    nzfssNo: string;
    dateOfBirth: string;
    breed: string;
    deceased: boolean;
}
export declare class DogInput {
    dogId?: string;
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
    address?: string;
    phone?: string;
    email?: string;
    dateOfBirth?: string;
    guardianDetails?: string;
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
    address?: string;
    phone?: string;
    email?: string;
    dateOfBirth?: string;
    guardianDetails?: string;
    dogs: DogInput[];
    showProfileConsent?: boolean;
}
export declare class UpdateMusherInput {
    name?: string;
    registrationNo?: string;
    kennelRegistrationNo?: string;
    clubId?: string;
    address?: string;
    phone?: string;
    email?: string;
    dateOfBirth?: string;
    guardianDetails?: string;
    dogs?: DogInput[];
    showProfileConsent?: boolean;
}
