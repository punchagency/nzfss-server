import Context from "../types/context";
import { CreateLogInput, FindLogsByIdInput, Log } from "../schema/log.schema";
import { LogService } from "../service/log.service";
export default class LogsResolver {
    private logService;
    constructor(logService: LogService);
    createLog(context: Context, input: CreateLogInput): Promise<import("mongoose").Document<unknown, import("@typegoose/typegoose/lib/types").BeAnObject, Log, import("@typegoose/typegoose/lib/types").BeAnyObject> & Omit<Log & Required<{
        _id: string;
    }> & {
        __v: number;
    }, "typegooseName"> & import("@typegoose/typegoose/lib/types").IObjectWithTypegooseFunction>;
    getAllLogs(context: Context): Promise<(import("mongoose").FlattenMaps<{
        _id: string;
        userId: import("@typegoose/typegoose").Ref<import("../schema/user.schema").User>;
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
    findSingleLogsById(input: FindLogsByIdInput, context: Context): Promise<import("mongoose").FlattenMaps<{
        _id: string;
        userId: import("@typegoose/typegoose").Ref<import("../schema/user.schema").User>;
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
    findLogsByEntrantId(entrantId: string, context: Context): Promise<(import("mongoose").FlattenMaps<{
        _id: string;
        userId: import("@typegoose/typegoose").Ref<import("../schema/user.schema").User>;
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
    deleteLog(context: Context, logId: String): Promise<import("mongoose").FlattenMaps<{
        _id: string;
        userId: import("@typegoose/typegoose").Ref<import("../schema/user.schema").User>;
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
}
