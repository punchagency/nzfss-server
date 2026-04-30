import { CreateClubInput, FindClubByIdInput, UpdateClubInput } from "../club.schema";
import Context from "../../types/context";
import { User } from "../user.schema";
import UserService from "./user.service";
export declare class ClubService {
    private userService;
    constructor(userService: UserService);
    createClub(input: CreateClubInput, context: Context): Promise<import("mongoose").Document<unknown, import("@typegoose/typegoose/lib/types").BeAnObject, import("../club.schema").Club, import("@typegoose/typegoose/lib/types").BeAnyObject> & Omit<import("../club.schema").Club & Required<{
        _id: string;
    }> & {
        __v: number;
    }, "typegooseName"> & import("@typegoose/typegoose/lib/types").IObjectWithTypegooseFunction>;
    getAllClubs(user: User): Promise<(import("mongoose").FlattenMaps<{
        _id: string;
        clubName: string;
        email: string;
        password: string;
        createdAt: Date;
    }> & Required<{
        _id: string;
    }> & {
        __v: number;
    })[]>;
    findClubById(input: FindClubByIdInput, user: User): Promise<import("mongoose").FlattenMaps<{
        _id: string;
        clubName: string;
        email: string;
        password: string;
        createdAt: Date;
    }> & Required<{
        _id: string;
    }> & {
        __v: number;
    }>;
    updateClub(input: UpdateClubInput, user: User, clubId: String): Promise<import("mongoose").Document<unknown, import("@typegoose/typegoose/lib/types").BeAnObject, import("../club.schema").Club, import("@typegoose/typegoose/lib/types").BeAnyObject> & Omit<import("../club.schema").Club & Required<{
        _id: string;
    }> & {
        __v: number;
    }, "typegooseName"> & import("@typegoose/typegoose/lib/types").IObjectWithTypegooseFunction>;
    deleteClub(user: User, clubId: String): Promise<import("mongoose").FlattenMaps<{
        _id: string;
        clubName: string;
        email: string;
        password: string;
        createdAt: Date;
    }> & Required<{
        _id: string;
    }> & {
        __v: number;
    }>;
}
