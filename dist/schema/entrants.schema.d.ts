import { Ref } from "@typegoose/typegoose";
import { User } from "./user.schema";
import { EventCalendar } from "./calendar.schema";
import { HeatData } from './heat.schema';
export declare class Dog {
    driverName: string;
    name: string;
    NZFSSRegistration: string;
    dob?: string;
    breed: string;
}
export declare class Entrants {
    _id: string;
    raceFormat: string;
    class: string;
    customClass: string;
    name: string;
    associatedDog: Dog[];
    raceType: string;
    startTime?: string;
    raceTime?: string;
    cutoffTime?: string;
    userId: Ref<User>;
    eventId: Ref<EventCalendar>;
    temperature?: string;
    distance?: string;
    heat?: string;
    heatsData?: HeatData[];
    dogWeight?: string;
    weightPulled?: string;
    createdAt: Date;
}
export declare const EntrantModel: import("@typegoose/typegoose").ReturnModelType<typeof Entrants, import("@typegoose/typegoose/lib/types").BeAnObject>;
export declare class CreateEntrantInput {
    name: string;
    raceFormat: string;
    class: string;
    customClass: string;
    associatedDog: Dog[];
    raceType: string;
    startTime?: string;
    raceTime?: string;
    cutoffTime?: string;
    eventId: string;
    temperature?: string;
    distance?: string;
    heat?: string;
    heatsData?: HeatData[];
    dogWeight?: string;
    weightPulled?: string;
}
export declare class UpdateEntrantInput {
    name?: string;
    associatedDog?: Dog[];
    raceFormat?: string;
    class?: string;
    customClass?: string;
    raceType?: string;
    startTime?: string;
    raceTime?: string;
    cutoffTime?: string;
    temperature?: string;
    distance?: string;
    heat?: string;
    heatsData?: HeatData[];
    dogWeight?: string;
    weightPulled?: string;
}
export declare class FindEntrantByIdInput {
    _id: string;
}
