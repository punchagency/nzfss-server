export declare enum Status {
    Pending = "Pending",
    Approve = "Approve",
    Declined = "Declined"
}
export declare class EventCalendar {
    _id: string;
    preferredDate: string;
    alternativeDate: string;
    date: boolean;
    NZFSSSanctioning: boolean;
    public: boolean;
    isSubmitted: boolean;
    status: Status;
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
}
export declare const EventCalendarModel: import("@typegoose/typegoose").ReturnModelType<typeof EventCalendar, import("@typegoose/typegoose/lib/types").BeAnObject>;
export declare class CreateEventCalendarInput {
    preferredDate: string;
    alternativeDate: string;
    eventName: string;
    eventDate: string;
    club: string;
    region: string;
    photo: string;
    entryForm?: string;
    fileName?: string;
    type: string;
    clubId: string;
    website?: string;
    reason?: string;
    date: boolean;
    NZFSSSanctioning: boolean;
    public: boolean;
    status: Status;
    isSubmitted: boolean;
    result: boolean;
}
export declare class UpdateEventCalendarInput {
    preferredDate?: string;
    alternativeDate?: string;
    date?: boolean;
    NZFSSSanctioning?: boolean;
    public?: boolean;
    isSubmitted?: boolean;
    status?: Status;
    eventName?: string;
    eventDate?: string;
    club?: string;
    clubId?: string;
    region?: string;
    entryForm?: string;
    fileName?: string;
    photo?: string;
    type?: string;
    result?: boolean;
    website?: string;
    reason?: string;
}
export declare class FindEventCalendarByIdInput {
    _id: string;
}
