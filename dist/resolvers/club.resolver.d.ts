import { Club, CreateClubInput, FindClubByIdInput, UpdateClubInput } from "../schema/club.schema";
import Context from "../types/context";
import { ClubService } from "../service/club.service";
import UserService from "../service/user.service";
export default class ClubResolver {
    private clubService;
    private userService;
    constructor(clubService: ClubService, userService: UserService);
    createClub(context: Context, input: CreateClubInput): Promise<import("mongoose").Document<unknown, import("@typegoose/typegoose/lib/types").BeAnObject, Club, import("@typegoose/typegoose/lib/types").BeAnyObject> & Omit<Club & Required<{
        _id: string;
    }> & {
        __v: number;
    }, "typegooseName"> & import("@typegoose/typegoose/lib/types").IObjectWithTypegooseFunction>;
    getAllClubs(context: Context): Promise<(import("mongoose").FlattenMaps<{
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
    findSingleClubById(input: FindClubByIdInput, context: Context): Promise<import("mongoose").FlattenMaps<{
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
    updateClubDetails(context: Context, input: UpdateClubInput, clubId: String): Promise<import("mongoose").Document<unknown, import("@typegoose/typegoose/lib/types").BeAnObject, Club, import("@typegoose/typegoose/lib/types").BeAnyObject> & Omit<Club & Required<{
        _id: string;
    }> & {
        __v: number;
    }, "typegooseName"> & import("@typegoose/typegoose/lib/types").IObjectWithTypegooseFunction>;
    deleteClub(context: Context, clubId: String): Promise<import("mongoose").FlattenMaps<{
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
