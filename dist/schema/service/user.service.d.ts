import { ApolloError } from "apollo-server";
import { CreateUserInput, FindUserByIdInput, LoginInput, UpdateUserInput, User, UserRole } from "../user.schema";
import Context from "../../types/context";
declare class UserService {
    createUser(input: CreateUserInput): Promise<import("mongoose").Document<unknown, import("@typegoose/typegoose/lib/types").BeAnObject, User, import("@typegoose/typegoose/lib/types").BeAnyObject> & Omit<User & Required<{
        _id: string;
    }> & {
        __v: number;
    }, "typegooseName"> & import("@typegoose/typegoose/lib/types").IObjectWithTypegooseFunction>;
    createClub(input: CreateUserInput): Promise<User>;
    login(input: LoginInput, context: Context): Promise<{
        token: string;
        _id: string;
        name: string;
        email: string;
        role: UserRole;
    }>;
    findUserById(input: FindUserByIdInput, currentUser: User): Promise<(import("mongoose").FlattenMaps<{
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
        club?: {
            _id: string;
            clubName: string;
            email: string;
            password: string;
            createdAt: Date;
        };
        created_at: Date;
    }> & Required<{
        _id: string;
    }> & {
        __v: number;
    }) | ApolloError>;
    findClubById(input: FindUserByIdInput, currentUser: User): Promise<import("mongoose").FlattenMaps<{
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
        club?: {
            _id: string;
            clubName: string;
            email: string;
            password: string;
            createdAt: Date;
        };
        created_at: Date;
    }> & Required<{
        _id: string;
    }> & {
        __v: number;
    }>;
    getAllUsers(user: User): Promise<(import("mongoose").FlattenMaps<{
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
        club?: {
            _id: string;
            clubName: string;
            email: string;
            password: string;
            createdAt: Date;
        };
        created_at: Date;
    }> & Required<{
        _id: string;
    }> & {
        __v: number;
    })[]>;
    getAllClubs(user: User): Promise<User[]>;
    updateUserProfile(input: UpdateUserInput & {
        user: User["_id"];
    }, userInformation: User): Promise<User>;
    updateClub(input: UpdateUserInput, userInformation: User, clubId: String): Promise<User>;
    deleteUser(userId: String, user: User): Promise<import("mongoose").FlattenMaps<{
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
        club?: {
            _id: string;
            clubName: string;
            email: string;
            password: string;
            createdAt: Date;
        };
        created_at: Date;
    }> & Required<{
        _id: string;
    }> & {
        __v: number;
    }>;
    deleteClub(userId: String, user: User): Promise<import("mongoose").FlattenMaps<{
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
        club?: {
            _id: string;
            clubName: string;
            email: string;
            password: string;
            createdAt: Date;
        };
        created_at: Date;
    }> & Required<{
        _id: string;
    }> & {
        __v: number;
    }>;
}
export default UserService;
