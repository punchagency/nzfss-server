import { ReturnModelType } from "@typegoose/typegoose";
import { Club } from "./club.schema";
export declare enum UserRole {
    ADMIN = "ADMIN",
    CLUB = "CLUB"
}
export declare class User {
    _id: string;
    name: string;
    email: string;
    password: string;
    gender?: string;
    address?: string;
    city?: string;
    postCode?: string;
    dob?: string;
    role: UserRole;
    club?: Club;
    created_at: Date;
}
export declare class LoginResponse {
    _id: string;
    name: string;
    email: string;
    role: UserRole;
    token?: string;
}
export declare const UserModel: ReturnModelType<typeof User, import("@typegoose/typegoose/lib/types").BeAnObject>;
export declare class CreateUserInput {
    name: string;
    email: string;
    password: string;
    role: UserRole;
}
export declare class LoginInput {
    email: string;
    password: string;
    rememberMe: boolean;
}
export declare class FindUserByIdInput {
    _id: string;
}
export declare class UpdateUserInput {
    name?: string;
    email?: string;
    password?: string;
    newPassword?: string;
}
