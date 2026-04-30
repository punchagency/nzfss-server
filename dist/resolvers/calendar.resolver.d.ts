import Context from "../types/context";
import { CalendarService } from "../service/calender.service";
import { CreateEventCalendarInput, EventCalendar, FindEventCalendarByIdInput, UpdateEventCalendarInput } from "../schema/calendar.schema";
export default class CalendarResolver {
    private calendarService;
    constructor(calendarService: CalendarService);
    createEvent(context: Context, input: CreateEventCalendarInput): Promise<EventCalendar>;
    getAllEvents(context: Context): Promise<any>;
    getEventsWithResults(context: Context): Promise<any>;
    findEventCalendarById(input: FindEventCalendarByIdInput, context: Context): Promise<{
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
    updateEventCalendar(context: Context, eventId: string, input: UpdateEventCalendarInput): Promise<EventCalendar>;
    deleteEvent(context: Context, eventId: string): Promise<import("mongoose").FlattenMaps<{
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
