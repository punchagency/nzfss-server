import Context from "../types/context";
import { YearbookService } from "../service/yearbook.service";
import { CreateYearbookInput, FindYearbookByIdInput, UpdateYearbookInput, Yearbook } from "../schema/yearbook.schema";
import { ApolloError } from "apollo-server";
export default class YearbookResolver {
    private yearbookService;
    constructor(yearbookService: YearbookService);
    createYearbook(context: Context, input: CreateYearbookInput): Promise<import("mongoose").Document<unknown, import("@typegoose/typegoose/lib/types").BeAnObject, Yearbook, import("@typegoose/typegoose/lib/types").BeAnyObject> & Omit<Yearbook & Required<{
        _id: string;
    }> & {
        __v: number;
    }, "typegooseName"> & import("@typegoose/typegoose/lib/types").IObjectWithTypegooseFunction>;
    getAllYearbooks(context: Context): Promise<(import("mongoose").FlattenMaps<{
        _id: string;
        yearbook: string;
        yearbookName: string;
        yearPublish: string;
    }> & Required<{
        _id: string;
    }> & {
        __v: number;
    })[]>;
    findYearbookById(input: FindYearbookByIdInput, context: Context): Promise<import("mongoose").FlattenMaps<{
        _id: string;
        yearbook: string;
        yearbookName: string;
        yearPublish: string;
    }> & Required<{
        _id: string;
    }> & {
        __v: number;
    }>;
    updateYearbook(context: Context, input: UpdateYearbookInput, yearbookId: String): Promise<import("mongoose").Document<unknown, import("@typegoose/typegoose/lib/types").BeAnObject, Yearbook, import("@typegoose/typegoose/lib/types").BeAnyObject> & Omit<Yearbook & Required<{
        _id: string;
    }> & {
        __v: number;
    }, "typegooseName"> & import("@typegoose/typegoose/lib/types").IObjectWithTypegooseFunction>;
    deleteYearbook(context: Context, yearbookId: String): Promise<ApolloError | (import("mongoose").FlattenMaps<{
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
