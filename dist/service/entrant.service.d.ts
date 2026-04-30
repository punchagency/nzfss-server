import { CreateEntrantInput, FindEntrantByIdInput, UpdateEntrantInput } from "../schema/entrants.schema";
import { LogService } from "./log.service";
import { Context } from "../types/context";
export declare class EntrantService {
    private logService;
    constructor(logService: LogService);
    createEntrant(input: CreateEntrantInput, userId?: string): Promise<import("mongoose").Document<unknown, import("@typegoose/typegoose/lib/types").BeAnObject, import("../schema/entrants.schema").Entrants, import("@typegoose/typegoose/lib/types").BeAnyObject> & Omit<import("../schema/entrants.schema").Entrants & Required<{
        _id: string;
    }> & {
        __v: number;
    }, "typegooseName"> & import("@typegoose/typegoose/lib/types").IObjectWithTypegooseFunction>;
    getAllEntrants(user: Context["user"]): Promise<any[]>;
    findEntrantById(input: FindEntrantByIdInput): Promise<import("mongoose").FlattenMaps<{
        _id: string;
        raceFormat: string;
        class: string;
        customClass: string;
        name: string;
        associatedDog: {
            driverName: string;
            name: string;
            NZFSSRegistration: string;
            dob?: string;
            breed: string;
        }[];
        raceType: string;
        startTime?: string;
        raceTime?: string;
        cutoffTime?: string;
        userId: import("@typegoose/typegoose").Ref<import("../schema/user.schema").User>;
        eventId: import("@typegoose/typegoose").Ref<import("../schema/calendar.schema").EventCalendar>;
        temperature?: string;
        distance?: string;
        heat?: string;
        heatsData?: {
            heat: string;
            temperature: string;
            distance: string;
            class: string;
        }[];
        dogWeight?: string;
        weightPulled?: string;
        createdAt: Date;
    }> & Required<{
        _id: string;
    }> & {
        __v: number;
    }>;
    updateEntrant(input: UpdateEntrantInput, entrantId: string, userId: string): Promise<import("mongoose").Document<unknown, import("@typegoose/typegoose/lib/types").BeAnObject, import("../schema/entrants.schema").Entrants, import("@typegoose/typegoose/lib/types").BeAnyObject> & Omit<import("../schema/entrants.schema").Entrants & Required<{
        _id: string;
    }> & {
        __v: number;
    }, "typegooseName"> & import("@typegoose/typegoose/lib/types").IObjectWithTypegooseFunction>;
    deleteEntrant(entrantId: string): Promise<import("mongoose").FlattenMaps<{
        _id: string;
        raceFormat: string;
        class: string;
        customClass: string;
        name: string;
        associatedDog: {
            driverName: string;
            name: string;
            NZFSSRegistration: string;
            dob?: string;
            breed: string;
        }[];
        raceType: string;
        startTime?: string;
        raceTime?: string;
        cutoffTime?: string;
        userId: import("@typegoose/typegoose").Ref<import("../schema/user.schema").User>;
        eventId: import("@typegoose/typegoose").Ref<import("../schema/calendar.schema").EventCalendar>;
        temperature?: string;
        distance?: string;
        heat?: string;
        heatsData?: {
            heat: string;
            temperature: string;
            distance: string;
            class: string;
        }[];
        dogWeight?: string;
        weightPulled?: string;
        createdAt: Date;
    }> & Required<{
        _id: string;
    }> & {
        __v: number;
    }>;
    deleteEntrantsByEventId(eventId: string): Promise<{
        deletedEntrantsCount: number;
        deletedPointsCount: number;
        acknowledged: boolean;
    }>;
    private getChanges;
    findEntrantsByEventId(eventId: string): Promise<(import("mongoose").FlattenMaps<{
        _id: string;
        raceFormat: string;
        class: string;
        customClass: string;
        name: string;
        associatedDog: {
            driverName: string;
            name: string;
            NZFSSRegistration: string;
            dob?: string;
            breed: string;
        }[];
        raceType: string;
        startTime?: string;
        raceTime?: string;
        cutoffTime?: string;
        userId: import("@typegoose/typegoose").Ref<import("../schema/user.schema").User>;
        eventId: import("@typegoose/typegoose").Ref<import("../schema/calendar.schema").EventCalendar>;
        temperature?: string;
        distance?: string;
        heat?: string;
        heatsData?: {
            heat: string;
            temperature: string;
            distance: string;
            class: string;
        }[];
        dogWeight?: string;
        weightPulled?: string;
        createdAt: Date;
    }> & Required<{
        _id: string;
    }> & {
        __v: number;
    })[]>;
}
