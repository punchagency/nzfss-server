"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const apollo_server_1 = require("apollo-server");
const notification_schema_1 = require("../schema/notification.schema");
const user_schema_1 = require("../schema/user.schema");
const logger_1 = require("../utils/logger");
const club_schema_1 = require("../schema/club.schema");
const email_service_1 = require("./email.service");
class NotificationService {
    constructor() {
        this.emailService = new email_service_1.EmailService();
    }
    async createNotification(input) {
        try {
            const notification = await notification_schema_1.NotificationModel.create(input);
            try {
                let recipientEmail;
                const userDoc = await user_schema_1.UserModel.findById(input.userId).lean();
                if (userDoc?.email)
                    recipientEmail = userDoc.email;
                if (!recipientEmail) {
                    const clubDoc = await club_schema_1.ClubModel.findById(input.userId).lean();
                    if (clubDoc?.email)
                        recipientEmail = clubDoc.email;
                }
                if (recipientEmail) {
                    await this.emailService.sendGenericNotification(recipientEmail, input.title, input.message);
                    logger_1.logger.info(`Notification email sent to recipient: ${recipientEmail}`);
                }
                else {
                    logger_1.logger.warn(`No recipient email found for notification userId=${input.userId}`);
                }
            }
            catch (emailErr) {
                logger_1.logger.error('Failed to send notification email to club:', emailErr);
            }
            return notification;
        }
        catch (error) {
            console.error("Error creating notification:", error);
            logger_1.logger.error(error instanceof Error ? error.message : error);
            throw new apollo_server_1.ApolloError("Failed to create notification");
        }
    }
    async getUnreadNotifications(user) {
        try {
            const notifications = await notification_schema_1.NotificationModel.find({
                userId: user._id,
                isRead: false,
            })
                .sort({ createdAt: -1 })
                .lean();
            return notifications;
        }
        catch (error) {
            console.error("Error fetching unread notifications:", error);
            logger_1.logger.error(error instanceof Error ? error.message : error);
            throw new apollo_server_1.ApolloError("Failed to fetch notifications");
        }
    }
    async getAllNotifications(user) {
        try {
            const notifications = await notification_schema_1.NotificationModel.find({
                userId: user._id,
            })
                .sort({ createdAt: -1 })
                .lean();
            return notifications;
        }
        catch (error) {
            logger_1.logger.error(error instanceof Error ? error.message : error);
            throw new apollo_server_1.ApolloError("Failed to fetch notifications");
        }
    }
    async markNotificationAsRead(notificationId, user) {
        try {
            const notification = await notification_schema_1.NotificationModel.findOneAndUpdate({
                _id: notificationId,
                userId: user._id,
            }, { isRead: true }, { new: true });
            if (!notification) {
                throw new apollo_server_1.ApolloError("Notification not found");
            }
            return notification;
        }
        catch (error) {
            logger_1.logger.error(error instanceof Error ? error.message : error);
            throw new apollo_server_1.ApolloError("Failed to mark notification as read");
        }
    }
    async markAllNotificationsAsRead(user) {
        try {
            await notification_schema_1.NotificationModel.updateMany({ userId: user._id, isRead: false }, { isRead: true });
            return true;
        }
        catch (error) {
            logger_1.logger.error(error instanceof Error ? error.message : error);
            throw new apollo_server_1.ApolloError("Failed to mark all notifications as read");
        }
    }
}
exports.NotificationService = NotificationService;
//# sourceMappingURL=notification.service.js.map