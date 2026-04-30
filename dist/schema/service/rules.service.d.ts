import { ApolloError } from "apollo-server";
import { User } from "../user.schema";
import { CreateRulesInput, FindRulesByIdInput, UpdateRulesInput } from "../rules.schema";
export declare class RulesService {
    createRules(input: CreateRulesInput, user: User): Promise<import("mongoose").Document<unknown, import("@typegoose/typegoose/lib/types").BeAnObject, import("../rules.schema").Rules, import("@typegoose/typegoose/lib/types").BeAnyObject> & Omit<import("../rules.schema").Rules & Required<{
        _id: string;
    }> & {
        __v: number;
    }, "typegooseName"> & import("@typegoose/typegoose/lib/types").IObjectWithTypegooseFunction>;
    getAllRules(user: User): Promise<(import("mongoose").FlattenMaps<{
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
    findRulesById(input: FindRulesByIdInput, user: User): Promise<import("mongoose").FlattenMaps<{
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
    updateRules(input: UpdateRulesInput, user: User, rulesId: String): Promise<import("mongoose").Document<unknown, import("@typegoose/typegoose/lib/types").BeAnObject, import("../rules.schema").Rules, import("@typegoose/typegoose/lib/types").BeAnyObject> & Omit<import("../rules.schema").Rules & Required<{
        _id: string;
    }> & {
        __v: number;
    }, "typegooseName"> & import("@typegoose/typegoose/lib/types").IObjectWithTypegooseFunction>;
    deleteRule(user: User, rulesId: String): Promise<ApolloError | (import("mongoose").FlattenMaps<{
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
