export declare class DogInfo {
    petName?: string;
    isDeceased?: boolean;
    nzfssNumber?: string;
    pedigreeName?: string;
    breed?: string;
    dateOfBirth?: string;
    nzkcRegistration?: string;
    nzkcOwner?: string;
}
export declare class Form {
    _id: string;
    formName: string;
    formType: string;
    file?: string;
    fileName: string;
    createdAt: Date;
    applicantName?: string;
    surname?: string;
    firstName?: string;
    address?: string;
    dateOfBirth?: string;
    phone?: string;
    email?: string;
    guardianDetails?: string;
    nzfssRegistrationNumber?: string;
    club?: string;
    affiliationFrom?: string;
    affiliationTo?: string;
    dogs?: DogInfo[];
    showProfileConsent?: boolean;
    status?: string;
}
export declare const FormModel: import("@typegoose/typegoose").ReturnModelType<typeof Form, import("@typegoose/typegoose/lib/types").BeAnObject>;
export declare class DogInput {
    petName?: string;
    isDeceased?: boolean;
    nzfssNumber?: string;
    pedigreeName?: string;
    breed?: string;
    dateOfBirth?: string;
    nzkcRegistration?: string;
    nzkcOwner?: string;
}
export declare class CreateFormInput {
    formName: string;
    formType: string;
    file?: string;
    fileName?: string;
    applicantName?: string;
    surname?: string;
    firstName?: string;
    address?: string;
    dateOfBirth?: string;
    phone?: string;
    email?: string;
    guardianDetails?: string;
    nzfssRegistrationNumber?: string;
    club?: string;
    affiliationFrom?: string;
    affiliationTo?: string;
    dogs?: DogInput[];
    showProfileConsent?: boolean;
    status?: string;
}
export declare class UpdateFormInput {
    formName?: string;
    formType?: string;
    file?: string;
    fileName?: string;
    status?: string;
}
export declare class FindFormByIdInput {
    formId: string;
}
