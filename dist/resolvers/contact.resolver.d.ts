import { Contact, CreateContactInput, UpdateContactInput, FindContactByIdInput } from "../schema/contact.schema";
import { ContactService } from "../service/contact.service";
import { Context } from "../types/context";
export default class ContactResolver {
    private contactService;
    constructor(contactService: ContactService);
    getAllContacts(context: Context): Promise<(import("mongoose").Document<unknown, import("@typegoose/typegoose/lib/types").BeAnObject, Contact, import("@typegoose/typegoose/lib/types").BeAnyObject> & Omit<Contact & Required<{
        _id: string;
    }> & {
        __v: number;
    }, "typegooseName"> & import("@typegoose/typegoose/lib/types").IObjectWithTypegooseFunction)[]>;
    createContact(context: Context, input: CreateContactInput): Promise<import("mongoose").Document<unknown, import("@typegoose/typegoose/lib/types").BeAnObject, Contact, import("@typegoose/typegoose/lib/types").BeAnyObject> & Omit<Contact & Required<{
        _id: string;
    }> & {
        __v: number;
    }, "typegooseName"> & import("@typegoose/typegoose/lib/types").IObjectWithTypegooseFunction>;
    findContactById(input: FindContactByIdInput, context: Context): Promise<import("mongoose").Document<unknown, import("@typegoose/typegoose/lib/types").BeAnObject, Contact, import("@typegoose/typegoose/lib/types").BeAnyObject> & Omit<Contact & Required<{
        _id: string;
    }> & {
        __v: number;
    }, "typegooseName"> & import("@typegoose/typegoose/lib/types").IObjectWithTypegooseFunction>;
    updateContact(context: Context, contactId: string, input: UpdateContactInput): Promise<import("mongoose").Document<unknown, import("@typegoose/typegoose/lib/types").BeAnObject, Contact, import("@typegoose/typegoose/lib/types").BeAnyObject> & Omit<Contact & Required<{
        _id: string;
    }> & {
        __v: number;
    }, "typegooseName"> & import("@typegoose/typegoose/lib/types").IObjectWithTypegooseFunction>;
    deleteContact(context: Context, contactId: string): Promise<import("mongoose").Document<unknown, import("@typegoose/typegoose/lib/types").BeAnObject, Contact, import("@typegoose/typegoose/lib/types").BeAnyObject> & Omit<Contact & Required<{
        _id: string;
    }> & {
        __v: number;
    }, "typegooseName"> & import("@typegoose/typegoose/lib/types").IObjectWithTypegooseFunction>;
}
