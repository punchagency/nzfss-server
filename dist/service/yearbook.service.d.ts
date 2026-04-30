import { ApolloError } from "apollo-server";
import { User } from "../schema/user.schema";
import { CreateYearbookInput, FindYearbookByIdInput, UpdateYearbookInput } from "../schema/yearbook.schema";
export declare class YearbookService {
    createYearbook(input: CreateYearbookInput, user: User): Promise<import("mongoose").Document<unknown, import("@typegoose/typegoose/lib/types").BeAnObject, import("../schema/yearbook.schema").Yearbook, import("@typegoose/typegoose/lib/types").BeAnyObject> & Omit<import("../schema/yearbook.schema").Yearbook & Required<{
        _id: string;
    }> & {
        __v: number;
    }, "typegooseName"> & import("@typegoose/typegoose/lib/types").IObjectWithTypegooseFunction>;
    getAllYearbooks(user: User | null): Promise<(import("mongoose").FlattenMaps<{
        _id: string;
        yearbook: string;
        yearbookName: string;
        yearPublish: string;
    }> & Required<{
        _id: string;
    }> & {
        __v: number;
    })[]>;
    findYearbookById(input: FindYearbookByIdInput, user: User | null): Promise<import("mongoose").FlattenMaps<{
        _id: string;
        yearbook: string;
        yearbookName: string;
        yearPublish: string;
    }> & Required<{
        _id: string;
    }> & {
        __v: number;
    }>;
    updateYearbook(input: UpdateYearbookInput, user: User, yearbookId: String): Promise<import("mongoose").Document<unknown, import("@typegoose/typegoose/lib/types").BeAnObject, import("../schema/yearbook.schema").Yearbook, import("@typegoose/typegoose/lib/types").BeAnyObject> & Omit<import("../schema/yearbook.schema").Yearbook & Required<{
        _id: string;
    }> & {
        __v: number;
    }, "typegooseName"> & import("@typegoose/typegoose/lib/types").IObjectWithTypegooseFunction>;
    deleteYearbook(user: User, yearbookId: String): Promise<ApolloError | (import("mongoose").FlattenMaps<{
        _id: string;
        yearbook: string;
        yearbookName: string;
        yearPublish: string;
    }> & Required<{
        _id: string;
    }> & {
        __v: number;
    })>;
}
