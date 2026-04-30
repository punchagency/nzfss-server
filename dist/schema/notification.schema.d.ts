import { Context } from "../types/context";
export declare class Notification {
    _id: string;
    title: string;
    message: string;
    type: string;
    isRead: boolean;
    userId: string;
    createdAt: Date;
    eventId?: string;
}
export declare class MarkNotificationAsReadInput {
    notificationId: string;
}
export declare class CreateNotificationInput {
    title: string;
    message: string;
    type: string;
    userId: string;
    eventId?: string;
}
export declare const NotificationModel: import("@typegoose/typegoose").ReturnModelType<typeof Notification, import("@typegoose/typegoose/lib/types").BeAnObject>;
export declare class NotificationResolver {
    private notificationService;
    constructor();
    createNotification(input: CreateNotificationInput, context: Context): Promise<import("mongoose").Document<unknown, import("@typegoose/typegoose/lib/types").BeAnObject, Notification, import("@typegoose/typegoose/lib/types").BeAnyObject> & Omit<Notification & Required<{
        _id: string;
    }> & {
        __v: number;
    }, "typegooseName"> & import("@typegoose/typegoose/lib/types").IObjectWithTypegooseFunction>;
    getUnreadNotifications(context: Context): Promise<(import("mongoose").FlattenMaps<{
        _id: string;
        title: string;
        message: string;
        type: string;
        isRead: boolean;
        userId: string;
        createdAt: Date;
        eventId?: string;
    }> & Required<{
        _id: string;
    }> & {
        __v: number;
    })[]>;
    getAllNotifications(context: Context): Promise<(import("mongoose").FlattenMaps<{
        _id: string;
        title: string;
        message: string;
        type: string;
        isRead: boolean;
        userId: string;
        createdAt: Date;
        eventId?: string;
    }> & Required<{
        _id: string;
    }> & {
        __v: number;
    })[]>;
    markNotificationAsRead(input: MarkNotificationAsReadInput, context: Context): Promise<import("mongoose").Document<unknown, import("@typegoose/typegoose/lib/types").BeAnObject, Notification, import("@typegoose/typegoose/lib/types").BeAnyObject> & Omit<Notification & Required<{
        _id: string;
    }> & {
        __v: number;
    }, "typegooseName"> & import("@typegoose/typegoose/lib/types").IObjectWithTypegooseFunction>;
    markAllNotificationsAsRead(context: Context): Promise<boolean>;
}
