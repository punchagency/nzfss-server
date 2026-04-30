import Context from "../types/context";
import UserService from "../service/user.service";
import { CreateDogInput, Dogs, FindDogsByIdInput, UpdateDogsInput } from "../schema/dog.schema";
import { DogsService } from "../service/dogs.service";
export default class DogsResolver {
    private dogsService;
    private userService;
    constructor(dogsService: DogsService, userService: UserService);
    createDog(context: Context, input: CreateDogInput): Promise<import("mongoose").Document<unknown, import("@typegoose/typegoose/lib/types").BeAnObject, Dogs, import("@typegoose/typegoose/lib/types").BeAnyObject> & Omit<Dogs & Required<{
        _id: string;
    }> & {
        __v: number;
    }, "typegooseName"> & import("@typegoose/typegoose/lib/types").IObjectWithTypegooseFunction>;
    getAllDogs(context: Context): Promise<(import("mongoose").FlattenMaps<{
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
    findSingleDogsById(input: FindDogsByIdInput, context: Context): Promise<import("mongoose").FlattenMaps<{
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
    updateDogsDetails(context: Context, input: UpdateDogsInput, dogId: String): Promise<import("mongoose").Document<unknown, import("@typegoose/typegoose/lib/types").BeAnObject, Dogs, import("@typegoose/typegoose/lib/types").BeAnyObject> & Omit<Dogs & Required<{
        _id: string;
    }> & {
        __v: number;
    }, "typegooseName"> & import("@typegoose/typegoose/lib/types").IObjectWithTypegooseFunction>;
    deleteDog(context: Context, dogId: String): Promise<import("mongoose").FlattenMaps<{
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
