import { User } from "./user.schema";
import { Ref } from "@typegoose/typegoose";
export declare class Contact {
    _id: string;
    name: string;
    designation: string;
    email: string;
    image?: string;
    created_at: Date;
    club: Ref<User>;
}
export declare class CreateContactInput {
    name: string;
    designation: string;
    email: string;
    image?: string;
    clubId: string;
}
export declare class UpdateContactInput {
    name?: string;
    designation?: string;
    email?: string;
    image?: string;
}
export declare class FindContactByIdInput {
    contactId: string;
}
