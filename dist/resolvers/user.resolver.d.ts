import { CreateUserInput, FindUserByIdInput, LoginInput, UpdateUserInput, User } from "../schema/user.schema";
import UserService from "../service/user.service";
import Context from "../types/context";
import { ApolloError } from "apollo-server";
export default class UserResolver {
    private userService;
    constructor(userService: UserService);
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
        role: import("../schema/user.schema").UserRole;
    }>;
    logout(ctx: Context): Promise<Boolean>;
    getCurrentUser(context: Context): Promise<User>;
    currentUser(context: Context): User;
    findUserById(input: FindUserByIdInput, context: Context): Promise<(import("mongoose").FlattenMaps<{
        _id: string;
        name: string;
        email: string;
        password: string;
        gender?: string;
        address?: string;
        city?: string;
        postCode?: string;
        dob?: string;
        role: import("../schema/user.schema").UserRole;
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
    findClubById(input: FindUserByIdInput, context: Context): Promise<import("mongoose").FlattenMaps<{
        _id: string;
        name: string;
        email: string;
        password: string;
        gender?: string;
        address?: string;
        city?: string;
        postCode?: string;
        dob?: string;
        role: import("../schema/user.schema").UserRole;
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
    getAllUsers(context: Context): Promise<(import("mongoose").FlattenMaps<{
        _id: string;
        name: string;
        email: string;
        password: string;
        gender?: string;
        address?: string;
        city?: string;
        postCode?: string;
        dob?: string;
        role: import("../schema/user.schema").UserRole;
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
    getAllClubs(context: Context): Promise<User[]>;
    updateUserProfile(context: Context, input: UpdateUserInput): Promise<User>;
    updateClub(context: Context, input: UpdateUserInput, clubId: String): Promise<User>;
    deleteUser(userId: String, context: Context): Promise<import("mongoose").FlattenMaps<{
        _id: string;
        name: string;
        email: string;
        password: string;
        gender?: string;
        address?: string;
        city?: string;
        postCode?: string;
        dob?: string;
        role: import("../schema/user.schema").UserRole;
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
    deleteClub(clubId: String, context: Context): Promise<import("mongoose").FlattenMaps<{
        _id: string;
        name: string;
        email: string;
        password: string;
        gender?: string;
        address?: string;
        city?: string;
        postCode?: string;
        dob?: string;
        role: import("../schema/user.schema").UserRole;
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
