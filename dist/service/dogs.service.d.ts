import UserService from "./user.service";
import { CreateDogInput, FindDogsByIdInput, UpdateDogsInput } from "../schema/dog.schema";
export declare class DogsService {
    private userService;
    constructor(userService: UserService);
    createDogs(input: CreateDogInput, userId?: string): Promise<import("mongoose").Document<unknown, import("@typegoose/typegoose/lib/types").BeAnObject, import("../schema/dog.schema").Dogs, import("@typegoose/typegoose/lib/types").BeAnyObject> & Omit<import("../schema/dog.schema").Dogs & Required<{
        _id: string;
    }> & {
        __v: number;
    }, "typegooseName"> & import("@typegoose/typegoose/lib/types").IObjectWithTypegooseFunction>;
    getAllDogs(): Promise<(import("mongoose").FlattenMaps<{
        _id: string;
        driverName: string;
        name: string;
        NZFSSRegistration: string;
        DateOfBirth?: string;
        Breed: string;
        userId: import("@typegoose/typegoose").Ref<import("../schema/user.schema").User>;
        createdAt: Date;
    }> & Required<{
        _id: string;
    }> & {
        __v: number;
    })[]>;
    findDogsById(input: FindDogsByIdInput): Promise<import("mongoose").FlattenMaps<{
        _id: string;
        driverName: string;
        name: string;
        NZFSSRegistration: string;
        DateOfBirth?: string;
        Breed: string;
        userId: import("@typegoose/typegoose").Ref<import("../schema/user.schema").User>;
        createdAt: Date;
    }> & Required<{
        _id: string;
    }> & {
        __v: number;
    }>;
    updateDogs(input: UpdateDogsInput, dogId: String): Promise<import("mongoose").Document<unknown, import("@typegoose/typegoose/lib/types").BeAnObject, import("../schema/dog.schema").Dogs, import("@typegoose/typegoose/lib/types").BeAnyObject> & Omit<import("../schema/dog.schema").Dogs & Required<{
        _id: string;
    }> & {
        __v: number;
    }, "typegooseName"> & import("@typegoose/typegoose/lib/types").IObjectWithTypegooseFunction>;
    deleteDogs(dogId: String): Promise<import("mongoose").FlattenMaps<{
        _id: string;
        driverName: string;
        name: string;
        NZFSSRegistration: string;
        DateOfBirth?: string;
        Breed: string;
        userId: import("@typegoose/typegoose").Ref<import("../schema/user.schema").User>;
        createdAt: Date;
    }> & Required<{
        _id: string;
    }> & {
        __v: number;
    }>;
}
