import { User } from "../schema/user.schema";
export declare class NotificationService {
    private emailService;
    createNotification(input: {
        title: string;
        message: string;
        type: string;
        userId: string;
        eventId?: string;
    }): Promise<import("mongoose").Document<unknown, import("@typegoose/typegoose/lib/types").BeAnObject, import("../schema/notification.schema").Notification, import("@typegoose/typegoose/lib/types").BeAnyObject> & Omit<import("../schema/notification.schema").Notification & Required<{
        _id: string;
    }> & {
        __v: number;
    }, "typegooseName"> & import("@typegoose/typegoose/lib/types").IObjectWithTypegooseFunction>;
    getUnreadNotifications(user: User): Promise<(import("mongoose").FlattenMaps<{
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
    getAllNotifications(user: User): Promise<(import("mongoose").FlattenMaps<{
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
    markNotificationAsRead(notificationId: string, user: User): Promise<import("mongoose").Document<unknown, import("@typegoose/typegoose/lib/types").BeAnObject, import("../schema/notification.schema").Notification, import("@typegoose/typegoose/lib/types").BeAnyObject> & Omit<import("../schema/notification.schema").Notification & Required<{
        _id: string;
    }> & {
        __v: number;
    }, "typegooseName"> & import("@typegoose/typegoose/lib/types").IObjectWithTypegooseFunction>;
    markAllNotificationsAsRead(user: User): Promise<boolean>;
}
