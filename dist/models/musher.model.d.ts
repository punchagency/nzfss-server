declare class TitleRecognition {
    sd: boolean;
    sdx: boolean;
    sdCh: boolean;
}
declare class Dog {
    dogId?: string;
    name: string;
    pedigreeName: string;
    nzkcNo: string;
    nzfssNo: string;
    dateOfBirth: string;
    breed: string;
    deceased: boolean;
    titleRecognition?: TitleRecognition;
}
declare class Musher {
    name: string;
    registrationNo: string;
    kennelRegistrationNo: string;
    club: string;
    address: string;
    phone: string;
    email: string;
    dateOfBirth: string;
    guardianDetails: string;
    dogs: Dog[];
    showProfileConsent: boolean;
}
export declare const MusherModel: import("@typegoose/typegoose").ReturnModelType<typeof Musher, import("@typegoose/typegoose/lib/types").BeAnObject>;
export {};
