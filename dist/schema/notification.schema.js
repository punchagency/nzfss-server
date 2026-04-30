"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationResolver = exports.NotificationModel = exports.CreateNotificationInput = exports.MarkNotificationAsReadInput = exports.Notification = void 0;
const typegoose_1 = require("@typegoose/typegoose");
const type_graphql_1 = require("type-graphql");
const notification_service_1 = require("../service/notification.service");
const is_auth_1 = require("../middleware/is-auth");
const apollo_server_1 = require("apollo-server");
let Notification = class Notification {
};
exports.Notification = Notification;
__decorate([
    (0, type_graphql_1.Field)(() => String),
    __metadata("design:type", String)
], Notification.prototype, "_id", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    (0, typegoose_1.prop)({ required: true }),
    __metadata("design:type", String)
], Notification.prototype, "title", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    (0, typegoose_1.prop)({ required: true }),
    __metadata("design:type", String)
], Notification.prototype, "message", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    (0, typegoose_1.prop)({ required: true }),
    __metadata("design:type", String)
], Notification.prototype, "type", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Boolean),
    (0, typegoose_1.prop)({ required: true, default: false }),
    __metadata("design:type", Boolean)
], Notification.prototype, "isRead", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    (0, typegoose_1.prop)({ required: true }),
    __metadata("design:type", String)
], Notification.prototype, "userId", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Date, { nullable: true }),
    (0, typegoose_1.prop)({ required: true, default: Date.now }),
    __metadata("design:type", Date)
], Notification.prototype, "createdAt", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    (0, typegoose_1.prop)(),
    __metadata("design:type", String)
], Notification.prototype, "eventId", void 0);
exports.Notification = Notification = __decorate([
    (0, type_graphql_1.ObjectType)()
], Notification);
let MarkNotificationAsReadInput = class MarkNotificationAsReadInput {
};
exports.MarkNotificationAsReadInput = MarkNotificationAsReadInput;
__decorate([
    (0, type_graphql_1.Field)(() => String),
    __metadata("design:type", String)
], MarkNotificationAsReadInput.prototype, "notificationId", void 0);
exports.MarkNotificationAsReadInput = MarkNotificationAsReadInput = __decorate([
    (0, type_graphql_1.InputType)()
], MarkNotificationAsReadInput);
let CreateNotificationInput = class CreateNotificationInput {
};
exports.CreateNotificationInput = CreateNotificationInput;
__decorate([
    (0, type_graphql_1.Field)(() => String),
    __metadata("design:type", String)
], CreateNotificationInput.prototype, "title", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    __metadata("design:type", String)
], CreateNotificationInput.prototype, "message", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    __metadata("design:type", String)
], CreateNotificationInput.prototype, "type", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    __metadata("design:type", String)
], CreateNotificationInput.prototype, "userId", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], CreateNotificationInput.prototype, "eventId", void 0);
exports.CreateNotificationInput = CreateNotificationInput = __decorate([
    (0, type_graphql_1.InputType)()
], CreateNotificationInput);
exports.NotificationModel = (0, typegoose_1.getModelForClass)(Notification);
let NotificationResolver = class NotificationResolver {
    constructor() {
        this.notificationService = new notification_service_1.NotificationService();
    }
    async createNotification(input, context) {
        const { user } = context;
        if (!user) {
            throw new apollo_server_1.ApolloError("Not authenticated");
        }
        if (user.role !== "ADMIN") {
            throw new apollo_server_1.ApolloError("Only admins can create notifications");
        }
        return this.notificationService.createNotification(input);
    }
    async getUnreadNotifications(context) {
        const { user } = context;
        if (!user) {
            console.error("No user found in context");
            throw new apollo_server_1.ApolloError("Not authenticated");
        }
        try {
            const notifications = await this.notificationService.getUnreadNotifications(user);
            return notifications;
        }
        catch (error) {
            console.error("Error in getUnreadNotifications:", error);
            throw error;
        }
    }
    async getAllNotifications(context) {
        const { user } = context;
        if (!user) {
            throw new apollo_server_1.ApolloError("Not authenticated");
        }
        return this.notificationService.getAllNotifications(user);
    }
    async markNotificationAsRead(input, context) {
        const { user } = context;
        if (!user) {
            throw new apollo_server_1.ApolloError("Not authenticated");
        }
        return this.notificationService.markNotificationAsRead(input.notificationId, user);
    }
    async markAllNotificationsAsRead(context) {
        const { user } = context;
        if (!user) {
            throw new apollo_server_1.ApolloError("Not authenticated");
        }
        return this.notificationService.markAllNotificationsAsRead(user);
    }
};
exports.NotificationResolver = NotificationResolver;
__decorate([
    (0, type_graphql_1.Mutation)(() => Notification),
    (0, type_graphql_1.UseMiddleware)(is_auth_1.isAuth),
    __param(0, (0, type_graphql_1.Arg)("input")),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateNotificationInput, Object]),
    __metadata("design:returntype", Promise)
], NotificationResolver.prototype, "createNotification", null);
__decorate([
    (0, type_graphql_1.Query)(() => [Notification]),
    (0, type_graphql_1.UseMiddleware)(is_auth_1.isAuth),
    __param(0, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationResolver.prototype, "getUnreadNotifications", null);
__decorate([
    (0, type_graphql_1.Query)(() => [Notification]),
    (0, type_graphql_1.UseMiddleware)(is_auth_1.isAuth),
    __param(0, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationResolver.prototype, "getAllNotifications", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Notification),
    (0, type_graphql_1.UseMiddleware)(is_auth_1.isAuth),
    __param(0, (0, type_graphql_1.Arg)("input")),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [MarkNotificationAsReadInput, Object]),
    __metadata("design:returntype", Promise)
], NotificationResolver.prototype, "markNotificationAsRead", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Boolean),
    (0, type_graphql_1.UseMiddleware)(is_auth_1.isAuth),
    __param(0, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationResolver.prototype, "markAllNotificationsAsRead", null);
exports.NotificationResolver = NotificationResolver = __decorate([
    (0, type_graphql_1.Resolver)(),
    __metadata("design:paramtypes", [])
], NotificationResolver);
//# sourceMappingURL=notification.schema.js.map