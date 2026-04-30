import { Contact } from "../schema/contact.schema";
import { CreateContactInput, UpdateContactInput } from "../schema/contact.schema";
import mongoose from "mongoose";
export declare class ContactService {
    createContact(input: CreateContactInput): Promise<mongoose.Document<unknown, import("@typegoose/typegoose/lib/types").BeAnObject, Contact, import("@typegoose/typegoose/lib/types").BeAnyObject> & Omit<Contact & Required<{
        _id: string;
    }> & {
        __v: number;
    }, "typegooseName"> & import("@typegoose/typegoose/lib/types").IObjectWithTypegooseFunction>;
    getAllContacts(): Promise<(mongoose.Document<unknown, import("@typegoose/typegoose/lib/types").BeAnObject, Contact, import("@typegoose/typegoose/lib/types").BeAnyObject> & Omit<Contact & Required<{
        _id: string;
    }> & {
        __v: number;
    }, "typegooseName"> & import("@typegoose/typegoose/lib/types").IObjectWithTypegooseFunction)[]>;
    findContactById(contactId: string): Promise<mongoose.Document<unknown, import("@typegoose/typegoose/lib/types").BeAnObject, Contact, import("@typegoose/typegoose/lib/types").BeAnyObject> & Omit<Contact & Required<{
        _id: string;
    }> & {
        __v: number;
    }, "typegooseName"> & import("@typegoose/typegoose/lib/types").IObjectWithTypegooseFunction>;
    updateContact(contactId: string, input: UpdateContactInput): Promise<mongoose.Document<unknown, import("@typegoose/typegoose/lib/types").BeAnObject, Contact, import("@typegoose/typegoose/lib/types").BeAnyObject> & Omit<Contact & Required<{
        _id: string;
    }> & {
        __v: number;
    }, "typegooseName"> & import("@typegoose/typegoose/lib/types").IObjectWithTypegooseFunction>;
    deleteContact(contactId: string): Promise<mongoose.Document<unknown, import("@typegoose/typegoose/lib/types").BeAnObject, Contact, import("@typegoose/typegoose/lib/types").BeAnyObject> & Omit<Contact & Required<{
        _id: string;
    }> & {
        __v: number;
    }, "typegooseName"> & import("@typegoose/typegoose/lib/types").IObjectWithTypegooseFunction>;
}
