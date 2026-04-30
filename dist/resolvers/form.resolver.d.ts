import Context from "../types/context";
import { CreateFormInput, FindFormByIdInput, Form, UpdateFormInput } from "../schema/form.schema";
import { FormService } from "../service/form.service";
export default class FormResolver {
    private formService;
    constructor(formService: FormService);
    createForm(context: Context, input: CreateFormInput): Promise<Form>;
    getAllForms(context: Context): Promise<(import("mongoose").FlattenMaps<{
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
    forms(context: Context, formType: string, status: string, clubId: string): Promise<(import("mongoose").FlattenMaps<{
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
    findFormById(input: FindFormByIdInput, context: Context): Promise<import("mongoose").FlattenMaps<{
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
    updateForm(context: Context, formId: String, input: UpdateFormInput): Promise<Form>;
    deleteForm(context: Context, formId: String): Promise<import("mongoose").FlattenMaps<{
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
    approveForm(context: Context, id: string): Promise<Form>;
    declineForm(context: Context, id: string): Promise<Form>;
}
