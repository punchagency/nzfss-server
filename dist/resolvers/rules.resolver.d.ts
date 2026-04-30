import Context from "../types/context";
import { ApolloError } from "apollo-server";
import { CreateRulesInput, FindRulesByIdInput, Rules, UpdateRulesInput } from "../schema/rules.schema";
import { RulesService } from "../service/rules.service";
export default class RulesResolver {
    private rulesService;
    constructor(rulesService: RulesService);
    createRules(context: Context, input: CreateRulesInput): Promise<import("mongoose").Document<unknown, import("@typegoose/typegoose/lib/types").BeAnObject, Rules, import("@typegoose/typegoose/lib/types").BeAnyObject> & Omit<Rules & Required<{
        _id: string;
    }> & {
        __v: number;
    }, "typegooseName"> & import("@typegoose/typegoose/lib/types").IObjectWithTypegooseFunction>;
    getAllRules(context: Context): Promise<(import("mongoose").FlattenMaps<{
        _id: string;
        constitutionRules: string;
        amendedDate: string;
        file: string;
        fileName: string;
        createdAt: Date;
    }> & Required<{
        _id: string;
    }> & {
        __v: number;
    })[]>;
    findRulesById(input: FindRulesByIdInput, context: Context): Promise<import("mongoose").FlattenMaps<{
        _id: string;
        constitutionRules: string;
        amendedDate: string;
        file: string;
        fileName: string;
        createdAt: Date;
    }> & Required<{
        _id: string;
    }> & {
        __v: number;
    }>;
    updateRules(context: Context, input: UpdateRulesInput, rulesId: String): Promise<import("mongoose").Document<unknown, import("@typegoose/typegoose/lib/types").BeAnObject, Rules, import("@typegoose/typegoose/lib/types").BeAnyObject> & Omit<Rules & Required<{
        _id: string;
    }> & {
        __v: number;
    }, "typegooseName"> & import("@typegoose/typegoose/lib/types").IObjectWithTypegooseFunction>;
    deleteRules(context: Context, rulesId: String): Promise<ApolloError | (import("mongoose").FlattenMaps<{
        _id: string;
        constitutionRules: string;
        amendedDate: string;
        file: string;
        fileName: string;
        createdAt: Date;
    }> & Required<{
        _id: string;
    }> & {
        __v: number;
    })>;
}
