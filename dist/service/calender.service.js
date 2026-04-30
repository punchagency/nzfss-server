"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CalendarService = void 0;
const apollo_server_1 = require("apollo-server");
const logger_1 = require("../utils/logger");
const calendar_schema_1 = require("../schema/calendar.schema");
const notification_service_1 = require("./notification.service");
const user_service_1 = __importDefault(require("../service/user.service"));
const entrant_service_1 = require("./entrant.service");
const log_service_1 = require("./log.service");
class CalendarService {
    constructor() {
        this.notificationService = new notification_service_1.NotificationService();
        this.userService = new user_service_1.default();
        this.entrantService = new entrant_service_1.EntrantService(new log_service_1.LogService());
    }
    async createCalendar(input) {
        try {
            console.log("Event type:", input.type);
            console.log("Input NZFSSSanctioning before save:", input.NZFSSSanctioning);
            const event = await calendar_schema_1.EventCalendarModel.create(input);
            console.log("Event NZFSSSanctioning after save:", event.NZFSSSanctioning);
            return event;
        }
        catch (error) {
            logger_1.logger.error("Error in createCalendar:", error);
            throw new apollo_server_1.ApolloError(`Error creating calendar event: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }
    async getAllCalendarEvents(user) {
        try {
            let events;
            if (user?.role === "ADMIN") {
                events = await calendar_schema_1.EventCalendarModel.find().sort({ eventDate: -1 }).lean();
            }
            else {
                const { PointModel } = await Promise.resolve().then(() => __importStar(require('../schema/point.schema')));
                const pointsWithEntrants = await PointModel.find({}).select('entrantId').lean();
                const entrantIdsWithPoints = pointsWithEntrants.map(p => p.entrantId);
                const { EntrantModel } = await Promise.resolve().then(() => __importStar(require('../schema/entrants.schema')));
                const entrantsWithPoints = await EntrantModel.find({
                    _id: { $in: entrantIdsWithPoints }
                }).select('eventId').lean();
                const eventIdsWithPoints = entrantsWithPoints.map(e => e.eventId);
                if (user?.role === "CLUB") {
                    events = await calendar_schema_1.EventCalendarModel.find({
                        $or: [
                            { clubId: user._id },
                            { public: true },
                            { _id: { $in: eventIdsWithPoints } }
                        ]
                    }).sort({ eventDate: -1 }).lean();
                }
                else {
                    events = await calendar_schema_1.EventCalendarModel.find({
                        $or: [
                            { public: true },
                            { _id: { $in: eventIdsWithPoints } }
                        ]
                    }).sort({ eventDate: -1 }).lean();
                }
            }
            logger_1.logger.info(`Fetched ${events.length} events for user`, {
                userId: user?._id,
                role: user?.role,
                clubId: user?.role === "CLUB" ? user._id : null
            });
            return events;
        }
        catch (error) {
            logger_1.logger.error(error instanceof Error ? error.message : error);
            if (error instanceof apollo_server_1.ApolloError) {
                throw error;
            }
            throw new apollo_server_1.ApolloError("Internal server error");
        }
    }
    async getEventsWithResults(user) {
        try {
            const { PointModel } = await Promise.resolve().then(() => __importStar(require('../schema/point.schema')));
            const pointsWithEntrants = await PointModel.find({}).select('entrantId').lean();
            const entrantIdsWithPoints = pointsWithEntrants.map(p => p.entrantId);
            if (entrantIdsWithPoints.length === 0) {
                return [];
            }
            const { EntrantModel } = await Promise.resolve().then(() => __importStar(require('../schema/entrants.schema')));
            const entrantsWithPoints = await EntrantModel.find({
                _id: { $in: entrantIdsWithPoints }
            }).select('eventId').lean();
            const eventIdsWithPoints = entrantsWithPoints.map(e => e.eventId);
            if (eventIdsWithPoints.length === 0) {
                return [];
            }
            let events;
            if (user?.role === "ADMIN") {
                events = await calendar_schema_1.EventCalendarModel.find({
                    _id: { $in: eventIdsWithPoints },
                    isSubmitted: true
                }).sort({ eventDate: -1 }).lean();
            }
            else if (user?.role === "CLUB") {
                events = await calendar_schema_1.EventCalendarModel.find({
                    _id: { $in: eventIdsWithPoints },
                    isSubmitted: true,
                    $or: [
                        { clubId: user._id },
                        { public: true }
                    ]
                }).sort({ eventDate: -1 }).lean();
            }
            else {
                events = await calendar_schema_1.EventCalendarModel.find({
                    _id: { $in: eventIdsWithPoints },
                    isSubmitted: true,
                    public: true
                }).sort({ eventDate: -1 }).lean();
            }
            logger_1.logger.info(`Fetched ${events.length} events with results for user`, {
                userId: user?._id,
                role: user?.role,
                clubId: user?.role === "CLUB" ? user._id : null
            });
            return events;
        }
        catch (error) {
            logger_1.logger.error(error instanceof Error ? error.message : error);
            if (error instanceof apollo_server_1.ApolloError) {
                throw error;
            }
            throw new apollo_server_1.ApolloError("Internal server error");
        }
    }
    async findEventCalendarById(input, user) {
        const error = "Event with the given Id does not exist";
        try {
            console.log(`Finding event with ID: ${input._id}`);
            const event = await calendar_schema_1.EventCalendarModel.findById(input._id).lean();
            if (!event) {
                console.log(`No event found with ID: ${input._id}`);
                throw new apollo_server_1.ApolloError(error);
            }
            const sanitizedEvent = {
                ...event,
                preferredDate: event.preferredDate || "Unknown date",
                alternativeDate: event.alternativeDate || "Unknown date",
                eventName: event.eventName || "Unnamed event",
                club: event.club || "Unknown club",
                region: event.region || "Unknown region",
                type: event.type || "Unknown type",
            };
            console.log(`Event found: ${JSON.stringify({
                _id: sanitizedEvent._id,
                eventName: sanitizedEvent.eventName,
                club: sanitizedEvent.club,
                type: sanitizedEvent.type,
                region: sanitizedEvent.region,
                eventDate: sanitizedEvent.eventDate
            })}`);
            return sanitizedEvent;
        }
        catch (error) {
            logger_1.logger.error(error instanceof Error ? error.message : error);
            if (error instanceof apollo_server_1.ApolloError) {
                throw error;
            }
            throw new apollo_server_1.ApolloError("Internal server error");
        }
    }
    async updateEventCalendar(input, user, eventId) {
        const isAdmin = user.role === "ADMIN";
        try {
            console.log("SERVICE - Updating event:", eventId);
            console.log("SERVICE - Input photo field:", input.photo === null ? "NULL" : input.photo === undefined ? "UNDEFINED" : `string with length ${input.photo?.length}`);
            console.log("SERVICE - Input has photo field:", 'photo' in input);
            console.log("SERVICE - Complete input:", Object.keys(input));
            const existingEvent = await calendar_schema_1.EventCalendarModel.findById(eventId);
            if (!existingEvent) {
                throw new apollo_server_1.ApolloError("Event does not exist");
            }
            if (!user || (!isAdmin && user._id !== existingEvent.clubId)) {
                throw new apollo_server_1.ApolloError("Unauthorized: Only admin can Update this club");
            }
            console.log("SERVICE - Existing event photo:", existingEvent.photo);
            console.log("SERVICE - About to update with $set:", input);
            const event = await calendar_schema_1.EventCalendarModel.findOneAndUpdate({ _id: eventId }, { $set: input }, { new: true });
            console.log("SERVICE - Updated event photo:", event?.photo);
            if (!event) {
                throw new apollo_server_1.ApolloError("Event not found or update failed");
            }
            if (input.isSubmitted === true && !existingEvent.isSubmitted) {
                console.log("Creating notification for admin - Event submission");
                console.log("Input isSubmitted:", input.isSubmitted);
                console.log("Existing event isSubmitted:", existingEvent.isSubmitted);
                const admins = await this.userService.getAdminUsers();
                console.log("Found admin users:", admins.map(admin => ({
                    id: admin._id,
                    name: admin.name,
                    email: admin.email,
                    role: admin.role
                })));
                for (const admin of admins) {
                    console.log("Creating notification for admin:", {
                        adminId: admin._id,
                        adminName: admin.name,
                        adminEmail: admin.email
                    });
                    const notification = await this.notificationService.createNotification({
                        title: "New Event Submission",
                        message: `Club "${event.club}" has submitted event "${event.eventName}" for approval`,
                        type: "EVENT_SUBMISSION",
                        userId: admin._id,
                        eventId: event._id,
                    });
                    console.log("Notification created:", notification);
                }
            }
            if (input.status && input.status !== existingEvent.status) {
                const approvedDate = event.eventDate ? new Date(event.eventDate).toLocaleDateString() : undefined;
                const statusMessage = input.status === "Approve"
                    ? `The date for your event "${event.eventName}" has been approved.${approvedDate ? ` Approved date: ${approvedDate}.` : ''}`
                    : "";
                if (statusMessage) {
                    await this.notificationService.createNotification({
                        title: `Event ${input.status === "Approve" ? "Approved" : input.status}`,
                        message: statusMessage,
                        type: "EVENT_STATUS_UPDATE",
                        userId: event.clubId,
                        eventId: event._id,
                    });
                }
            }
            return event;
        }
        catch (error) {
            logger_1.logger.error(error instanceof Error ? error.message : error);
            if (error instanceof apollo_server_1.ApolloError) {
                throw error;
            }
            throw new apollo_server_1.ApolloError("Internal server error");
        }
    }
    async deleteEvent(user, eventId) {
        try {
            const isAdmin = user.role === "ADMIN";
            const existingEvent = await calendar_schema_1.EventCalendarModel.findById(eventId);
            if (!existingEvent) {
                throw new apollo_server_1.ApolloError("Event does not exist");
            }
            if (!user || (!isAdmin && user._id !== existingEvent.clubId)) {
                throw new apollo_server_1.ApolloError("Unauthorized: Only admin can delete this club");
            }
            await this.entrantService.deleteEntrantsByEventId(eventId);
            const deletedEvent = await calendar_schema_1.EventCalendarModel.findByIdAndDelete(eventId).lean();
            return deletedEvent;
        }
        catch (error) {
            logger_1.logger.error(error instanceof Error ? error.message : error);
            if (error instanceof apollo_server_1.ApolloError) {
                throw error;
            }
            throw new apollo_server_1.ApolloError("Internal server error");
        }
    }
}
exports.CalendarService = CalendarService;
//# sourceMappingURL=calender.service.js.map