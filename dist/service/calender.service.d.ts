import { User } from "../schema/user.schema";
import { CreateEventCalendarInput, EventCalendar, FindEventCalendarByIdInput, UpdateEventCalendarInput } from "../schema/calendar.schema";
export declare class CalendarService {
    private notificationService;
    private userService;
    private entrantService;
    constructor();
    createCalendar(input: CreateEventCalendarInput): Promise<EventCalendar>;
    getAllCalendarEvents(user?: User): Promise<any>;
    getEventsWithResults(user?: User): Promise<any>;
    findEventCalendarById(input: FindEventCalendarByIdInput, user?: User): Promise<{
        preferredDate: string;
        alternativeDate: string;
        eventName: string;
        club: string;
        region: string;
        type: string;
        _id: string;
        date: boolean;
        NZFSSSanctioning: boolean;
        public: boolean;
        isSubmitted: boolean;
        status: import("../schema/calendar.schema").Status;
        eventDate: string;
        entryForm: string;
        fileName: string;
        website: string;
        reason: string;
        photo: string;
        result: boolean;
        createdAt?: Date;
        clubId: string;
        __v: number;
    }>;
    updateEventCalendar(input: UpdateEventCalendarInput, user: User, eventId: string): Promise<import("mongoose").Document<unknown, import("@typegoose/typegoose/lib/types").BeAnObject, EventCalendar, import("@typegoose/typegoose/lib/types").BeAnyObject> & Omit<EventCalendar & Required<{
        _id: string;
    }> & {
        __v: number;
    }, "typegooseName"> & import("@typegoose/typegoose/lib/types").IObjectWithTypegooseFunction>;
    deleteEvent(user: User, eventId: string): Promise<import("mongoose").FlattenMaps<{
        _id: string;
        preferredDate: string;
        alternativeDate: string;
        date: boolean;
        NZFSSSanctioning: boolean;
        public: boolean;
        isSubmitted: boolean;
        status: import("../schema/calendar.schema").Status;
        eventName: string;
        eventDate: string;
        club: string;
        region: string;
        entryForm: string;
        fileName: string;
        website: string;
        reason: string;
        photo: string;
        type: string;
        result: boolean;
        createdAt?: Date;
        clubId: string;
    }> & Required<{
        _id: string;
    }> & {
        __v: number;
    }>;
}
