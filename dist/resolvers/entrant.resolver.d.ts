import Context from "../types/context";
import { CreateEntrantInput, Entrants, FindEntrantByIdInput, UpdateEntrantInput } from "../schema/entrants.schema";
import { EntrantService } from "../service/entrant.service";
import { LogService } from "../service/log.service";
export default class EntrantResolver {
    private entrantService;
    private logService;
    constructor(entrantService: EntrantService, logService: LogService);
    createEntrant(context: Context, input: CreateEntrantInput): Promise<import("mongoose").Document<unknown, import("@typegoose/typegoose/lib/types").BeAnObject, Entrants, import("@typegoose/typegoose/lib/types").BeAnyObject> & Omit<Entrants & Required<{
        _id: string;
    }> & {
        __v: number;
    }, "typegooseName"> & import("@typegoose/typegoose/lib/types").IObjectWithTypegooseFunction>;
    getAllEntrants(context: Context): Promise<any[]>;
    findSingleEntrantById(input: FindEntrantByIdInput, context: Context): Promise<import("mongoose").FlattenMaps<{
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
    getEntrantsByEventId(eventId: string, context: Context): Promise<(import("mongoose").FlattenMaps<{
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
    updateEntrantDetails(context: Context, input: UpdateEntrantInput, entrantId: string): Promise<import("mongoose").Document<unknown, import("@typegoose/typegoose/lib/types").BeAnObject, Entrants, import("@typegoose/typegoose/lib/types").BeAnyObject> & Omit<Entrants & Required<{
        _id: string;
    }> & {
        __v: number;
    }, "typegooseName"> & import("@typegoose/typegoose/lib/types").IObjectWithTypegooseFunction>;
    deleteEntrant(context: Context, entrantId: string): Promise<import("mongoose").FlattenMaps<{
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
}
