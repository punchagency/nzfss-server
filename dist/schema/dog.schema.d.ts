import { Ref } from "@typegoose/typegoose";
import { User } from "./user.schema";
export declare class Dogs {
    _id: string;
    driverName: string;
    name: string;
    NZFSSRegistration: string;
    DateOfBirth?: string;
    Breed: string;
    userId: Ref<User>;
    createdAt: Date;
}
export declare const DogsModel: import("@typegoose/typegoose").ReturnModelType<typeof Dogs, import("@typegoose/typegoose/lib/types").BeAnObject>;
export declare class CreateDogInput {
    driverName: string;
    name: string;
    NZFSSRegistration: string;
    DateOfBirth?: string;
    Breed: string;
}
export declare class UpdateDogsInput {
    driverName?: string;
    name?: string;
    NZFSSRegistration?: string;
    DateOfBirth?: string;
    Breed?: string;
}
export declare class FindDogsByIdInput {
    _id: string;
}
