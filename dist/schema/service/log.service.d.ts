import { CreateLogInput, FindLogsByIdInput } from "../log.schema";
export declare class LogService {
    createLog(input: CreateLogInput): Promise<import("mongoose").Document<unknown, import("@typegoose/typegoose/lib/types").BeAnObject, import("../log.schema").Log, import("@typegoose/typegoose/lib/types").BeAnyObject> & Omit<import("../log.schema").Log & Required<{
        _id: string;
    }> & {
        __v: number;
    }, "typegooseName"> & import("@typegoose/typegoose/lib/types").IObjectWithTypegooseFunction>;
    getAllLogs(): Promise<(import("mongoose").FlattenMaps<{
        _id: string;
        userId: import("@typegoose/typegoose").Ref<import("../user.schema").User>;
        action: string;
        entity: string;
        entityId: string;
        oldData: string;
        newData: string;
        createdAt: Date;
    }> & Required<{
        _id: string;
    }> & {
        __v: number;
    })[]>;
    findLogById(input: FindLogsByIdInput): Promise<import("mongoose").FlattenMaps<{
        _id: string;
        userId: import("@typegoose/typegoose").Ref<import("../user.schema").User>;
        action: string;
        entity: string;
        entityId: string;
        oldData: string;
        newData: string;
        createdAt: Date;
    }> & Required<{
        _id: string;
    }> & {
        __v: number;
    }>;
    deleteLog(logId: String): Promise<import("mongoose").FlattenMaps<{
        _id: string;
        userId: import("@typegoose/typegoose").Ref<import("../user.schema").User>;
        action: string;
        entity: string;
        entityId: string;
        oldData: string;
        newData: string;
        createdAt: Date;
    }> & Required<{
        _id: string;
    }> & {
        __v: number;
    }>;
    findLogsByEntityId(entityId: string): Promise<(import("mongoose").FlattenMaps<{
        _id: string;
        userId: import("@typegoose/typegoose").Ref<import("../user.schema").User>;
        action: string;
        entity: string;
        entityId: string;
        oldData: string;
        newData: string;
        createdAt: Date;
    }> & Required<{
        _id: string;
    }> & {
        __v: number;
    })[]>;
    logUpdate(userId: string, entity: string, entityId: string, oldData: any, newData: any): Promise<import("mongoose").Document<unknown, import("@typegoose/typegoose/lib/types").BeAnObject, import("../log.schema").Log, import("@typegoose/typegoose/lib/types").BeAnyObject> & Omit<import("../log.schema").Log & Required<{
        _id: string;
    }> & {
        __v: number;
    }, "typegooseName"> & import("@typegoose/typegoose/lib/types").IObjectWithTypegooseFunction>;
}
