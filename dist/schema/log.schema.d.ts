import { Ref } from "@typegoose/typegoose";
import { User } from "./user.schema";
export declare class Log {
    _id: string;
    userId: Ref<User>;
    action: string;
    entity: string;
    entityId: string;
    oldData: string;
    newData: string;
    createdAt: Date;
}
export declare const LogModel: import("@typegoose/typegoose").ReturnModelType<typeof Log, import("@typegoose/typegoose/lib/types").BeAnObject>;
export declare class CreateLogInput {
    userId: string;
    action: string;
    entity: string;
    entityId: string;
    oldData: string;
    newData: string;
}
export declare class FindLogsByIdInput {
    _id: string;
}
