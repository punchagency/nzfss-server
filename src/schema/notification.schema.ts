import { getModelForClass, prop } from "@typegoose/typegoose";
import { Field, ObjectType, InputType, Resolver, Query, Mutation, Arg, Ctx, UseMiddleware } from "type-graphql";
import { NotificationService } from "../service/notification.service";
import { Context } from "../types/context";
import { isAuth } from "../middleware/is-auth";
import { ApolloError } from "apollo-server";

@ObjectType()
export class Notification {
  @Field(() => String)
  _id: string;

  @Field(() => String)
  @prop({ required: true })
  title: string;

  @Field(() => String)
  @prop({ required: true })
  message: string;

  @Field(() => String)
  @prop({ required: true })
  type: string;

  @Field(() => Boolean)
  @prop({ required: true, default: false })
  isRead: boolean;

  @Field(() => String)
  @prop({ required: true })
  userId: string;

  @Field(() => Date, { nullable: true })
  @prop({ required: true, default: Date.now })
  createdAt: Date;

  @Field(() => String, { nullable: true })
  @prop()
  eventId?: string;
}

@InputType()
export class MarkNotificationAsReadInput {
  @Field(() => String)
  notificationId: string;
}

@InputType()
export class CreateNotificationInput {
  @Field(() => String)
  title: string;

  @Field(() => String)
  message: string;

  @Field(() => String)
  type: string;

  @Field(() => String)
  userId: string;

  @Field(() => String, { nullable: true })
  eventId?: string;
}

export const NotificationModel = getModelForClass(Notification);

@Resolver()
export class NotificationResolver {
  private notificationService: NotificationService;

  constructor() {
    this.notificationService = new NotificationService();
  }

  @Mutation(() => Notification)
  @UseMiddleware(isAuth)
  async createNotification(
    @Arg("input") input: CreateNotificationInput,
    @Ctx() context: Context
  ) {
    const { user } = context;
    if (!user) {
      throw new ApolloError("Not authenticated");
    }
    
    // Optional: Add authorization check if needed
    if (user.role !== "ADMIN") {
      throw new ApolloError("Only admins can create notifications");
    }
    
    return this.notificationService.createNotification(input);
  }

  @Query(() => [Notification])
  @UseMiddleware(isAuth)
  async getUnreadNotifications(@Ctx() context: Context) {
    const { user } = context;
    if (!user) {
      console.error("No user found in context");
      throw new ApolloError("Not authenticated");
    }

    try {
      const notifications = await this.notificationService.getUnreadNotifications(user);
      return notifications;
    } catch (error) {
      console.error("Error in getUnreadNotifications:", error);
      throw error;
    }
  }

  @Query(() => [Notification])
  @UseMiddleware(isAuth)
  async getAllNotifications(@Ctx() context: Context) {
    const { user } = context;
    if (!user) {
      throw new ApolloError("Not authenticated");
    }
    return this.notificationService.getAllNotifications(user);
  }

  @Mutation(() => Notification)
  @UseMiddleware(isAuth)
  async markNotificationAsRead(
    @Arg("input") input: MarkNotificationAsReadInput,
    @Ctx() context: Context
  ) {
    const { user } = context;
    if (!user) {
      throw new ApolloError("Not authenticated");
    }
    return this.notificationService.markNotificationAsRead(input.notificationId, user);
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async markAllNotificationsAsRead(@Ctx() context: Context) {
    const { user } = context;
    if (!user) {
      throw new ApolloError("Not authenticated");
    }
    return this.notificationService.markAllNotificationsAsRead(user);
  }
} 