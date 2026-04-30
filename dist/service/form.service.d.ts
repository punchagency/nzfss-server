import { User } from "../schema/user.schema";
import { CreateFormInput, FindFormByIdInput, Form, UpdateFormInput } from "../schema/form.schema";
export declare class FormService {
    private notificationService;
    private emailService;
    constructor();
    createForm(input: CreateFormInput, user: User): Promise<Form>;
    getAllForms(user: User | null): Promise<(import("mongoose").FlattenMaps<{
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
        dogs?: {
            petName?: string;
            isDeceased?: boolean;
            nzfssNumber?: string;
            pedigreeName?: string;
            breed?: string;
            dateOfBirth?: string;
            nzkcRegistration?: string;
            nzkcOwner?: string;
        }[];
        showProfileConsent?: boolean;
        status?: string;
    }> & Required<{
        _id: string;
    }> & {
        __v: number;
    })[]>;
    getForms(user: User | null, formType?: string, status?: string, clubId?: string): Promise<(import("mongoose").FlattenMaps<{
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
        dogs?: {
            petName?: string;
            isDeceased?: boolean;
            nzfssNumber?: string;
            pedigreeName?: string;
            breed?: string;
            dateOfBirth?: string;
            nzkcRegistration?: string;
            nzkcOwner?: string;
        }[];
        showProfileConsent?: boolean;
        status?: string;
    }> & Required<{
        _id: string;
    }> & {
        __v: number;
    })[]>;
    findFormById(input: FindFormByIdInput, user: User): Promise<import("mongoose").FlattenMaps<{
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
        dogs?: {
            petName?: string;
            isDeceased?: boolean;
            nzfssNumber?: string;
            pedigreeName?: string;
            breed?: string;
            dateOfBirth?: string;
            nzkcRegistration?: string;
            nzkcOwner?: string;
        }[];
        showProfileConsent?: boolean;
        status?: string;
    }> & Required<{
        _id: string;
    }> & {
        __v: number;
    }>;
    updateForm(input: UpdateFormInput, user: User, formId: String): Promise<import("mongoose").Document<unknown, import("@typegoose/typegoose/lib/types").BeAnObject, Form, import("@typegoose/typegoose/lib/types").BeAnyObject> & Omit<Form & Required<{
        _id: string;
    }> & {
        __v: number;
    }, "typegooseName"> & import("@typegoose/typegoose/lib/types").IObjectWithTypegooseFunction>;
    deleteForm(user: User, formId: String): Promise<import("mongoose").FlattenMaps<{
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
        dogs?: {
            petName?: string;
            isDeceased?: boolean;
            nzfssNumber?: string;
            pedigreeName?: string;
            breed?: string;
            dateOfBirth?: string;
            nzkcRegistration?: string;
            nzkcOwner?: string;
        }[];
        showProfileConsent?: boolean;
        status?: string;
    }> & Required<{
        _id: string;
    }> & {
        __v: number;
    }>;
    updateFormStatus(formId: string, status: string, user: User): Promise<import("mongoose").Document<unknown, import("@typegoose/typegoose/lib/types").BeAnObject, Form, import("@typegoose/typegoose/lib/types").BeAnyObject> & Omit<Form & Required<{
        _id: string;
    }> & {
        __v: number;
    }, "typegooseName"> & import("@typegoose/typegoose/lib/types").IObjectWithTypegooseFunction>;
}
