import { ApolloError } from "apollo-server";
import { NotificationModel } from "../schema/notification.schema";
import { User, UserModel } from "../schema/user.schema";
import { logger } from "../utils/logger";
import { ClubModel } from "../schema/club.schema";
import { EmailService } from "./email.service";

export class NotificationService {
  private emailService = new EmailService();

  async createNotification(input: {
    title: string;
    message: string;
    type: string;
    userId: string;
    eventId?: string;
  }) {
    try {
      // console.log("Creating notification with input:", input);
      const notification = await NotificationModel.create(input);

      // Attempt to send an email to the recipient (supports both User and Club IDs)
      try {
        let recipientEmail: string | undefined;

        // Prefer User email (covers admins and club users who log in)
        const userDoc = await UserModel.findById(input.userId).lean();
        if (userDoc?.email) recipientEmail = userDoc.email;

        // Fallback to Club document by ID (legacy path)
        if (!recipientEmail) {
          const clubDoc = await ClubModel.findById(input.userId).lean();
          if (clubDoc?.email) recipientEmail = clubDoc.email;
        }

        if (recipientEmail) {
          await this.emailService.sendGenericNotification(recipientEmail, input.title, input.message);
          logger.info(`Notification email sent to recipient: ${recipientEmail}`);
        } else {
          logger.warn(`No recipient email found for notification userId=${input.userId}`);
        }
      } catch (emailErr) {
        logger.error('Failed to send notification email to club:', emailErr);
      }

      // console.log("Notification created successfully:", notification);
      return notification;
    } catch (error) {
      console.error("Error creating notification:", error);
      logger.error(error instanceof Error ? error.message : error);
      throw new ApolloError("Failed to create notification");
    }
  }

  async getUnreadNotifications(user: User) {
    try {
      // console.log("Fetching unread notifications for user:", user._id);
      const notifications = await NotificationModel.find({
        userId: user._id,
        isRead: false,
      })
        .sort({ createdAt: -1 })
        .lean();
      // console.log("Found unread notifications:", notifications);
      return notifications;
    } catch (error) {
      console.error("Error fetching unread notifications:", error);
      logger.error(error instanceof Error ? error.message : error);
      throw new ApolloError("Failed to fetch notifications");
    }
  }

  async getAllNotifications(user: User) {
    try {
      const notifications = await NotificationModel.find({
        userId: user._id,
      })
        .sort({ createdAt: -1 })
        .lean();
      return notifications;
    } catch (error) {
      logger.error(error instanceof Error ? error.message : error);
      throw new ApolloError("Failed to fetch notifications");
    }
  }

  async markNotificationAsRead(notificationId: string, user: User) {
    try {
      const notification = await NotificationModel.findOneAndUpdate(
        {
          _id: notificationId,
          userId: user._id,
        },
        { isRead: true },
        { new: true }
      );

      if (!notification) {
        throw new ApolloError("Notification not found");
      }

      return notification;
    } catch (error) {
      logger.error(error instanceof Error ? error.message : error);
      throw new ApolloError("Failed to mark notification as read");
    }
  }

  async markAllNotificationsAsRead(user: User) {
    try {
      await NotificationModel.updateMany(
        { userId: user._id, isRead: false },
        { isRead: true }
      );
      return true;
    } catch (error) {
      logger.error(error instanceof Error ? error.message : error);
      throw new ApolloError("Failed to mark all notifications as read");
    }
  }
} 