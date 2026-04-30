import { CreateEntrantInput, FindEntrantByIdInput, UpdateEntrantInput } from "../entrants.schema";
import { LogService } from "./log.service";
export declare class EntrantService {
    private logService;
    constructor(logService: LogService);
    createEntrant(input: CreateEntrantInput, userId?: string): Promise<import("mongoose").Document<unknown, import("@typegoose/typegoose/lib/types").BeAnObject, import("../entrants.schema").Entrants, import("@typegoose/typegoose/lib/types").BeAnyObject> & Omit<import("../entrants.schema").Entrants & Required<{
        _id: string;
    }> & {
        __v: number;
    }, "typegooseName"> & import("@typegoose/typegoose/lib/types").IObjectWithTypegooseFunction>;
    getAllEntrants(): Promise<(import("mongoose").FlattenMaps<{
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
        userId: import("@typegoose/typegoose").Ref<import("../user.schema").User>;
        eventId: import("@typegoose/typegoose").Ref<import("../calendar.schema").EventCalendar>;
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
        userId: import("@typegoose/typegoose").Ref<import("../user.schema").User>;
        eventId: import("@typegoose/typegoose").Ref<import("../calendar.schema").EventCalendar>;
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
    updateEntrant(input: UpdateEntrantInput, entrantId: string, userId: string): Promise<import("mongoose").FlattenMaps<{
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
        userId: import("@typegoose/typegoose").Ref<import("../user.schema").User>;
        eventId: import("@typegoose/typegoose").Ref<import("../calendar.schema").EventCalendar>;
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
        userId: import("@typegoose/typegoose").Ref<import("../user.schema").User>;
        eventId: import("@typegoose/typegoose").Ref<import("../calendar.schema").EventCalendar>;
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
    private getChanges;
}
