declare class Dog {
    name: string;
    pedigreeName: string;
    nzkcNo: string;
    nzfssNo: string;
    dateOfBirth: string;
    breed: string;
    deceased: boolean;
}
declare class Musher {
    name: string;
    registrationNo: string;
    kennelRegistrationNo: string;
    club: string;
    dogs: Dog[];
    showProfileConsent: boolean;
}
export declare const MusherModel: import("@typegoose/typegoose").ReturnModelType<typeof Musher, import("@typegoose/typegoose/lib/types").BeAnObject>;
export {};
