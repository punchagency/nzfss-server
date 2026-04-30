"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CalendarService = void 0;
const apollo_server_1 = require("apollo-server");
const logger_1 = require("../../utils/logger");
const calendar_schema_1 = require("../calendar.schema");
class CalendarService {
    async createCalendar(input) {
        try {
            const newEvent = await calendar_schema_1.EventCalendarModel.create(input);
            return newEvent;
        }
        catch (error) {
            if (error instanceof apollo_server_1.ApolloError) {
                throw error;
            }
            logger_1.logger.error("Error creating event:", error);
            throw new apollo_server_1.ApolloError("An unexpected error occurred while creating the event");
        }
    }
    async getAllCalendarEvents(user) {
        const isAdmin = user.role === "ADMIN";
        try {
            let events;
            if (isAdmin) {
                events = await calendar_schema_1.EventCalendarModel.find().lean();
            }
            else if (user.role === "CLUB") {
                events = await calendar_schema_1.EventCalendarModel.find({ clubId: user._id }).lean();
            }
            else {
                throw new Error("Unauthorized: Only admin or club can access this resource");
            }
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
        const error = " Event with the given Id does not exist";
        const isAdmin = user.role === "ADMIN";
        try {
            if (!user || !isAdmin) {
                throw new apollo_server_1.ApolloError("Unauthorized: Only admin can access this resource");
            }
            const event = await calendar_schema_1.EventCalendarModel.findById(input._id).lean();
            if (!event) {
                throw new apollo_server_1.ApolloError(error);
            }
            return event;
        }
        catch (error) {
            logger_1.logger.error(error instanceof Error ? error.message : error);
            if (error instanceof apollo_server_1.ApolloError) {
                throw error;
            }
            throw new apollo_server_1.ApolloError("Internal sever error ");
        }
    }
    async updateEventCalendar(input, user, eventId) {
        const isAdmin = user.role === "ADMIN";
        const existingEvent = await calendar_schema_1.EventCalendarModel.findById(eventId);
        if (!existingEvent) {
            throw new apollo_server_1.ApolloError("Event does not exit");
        }
        if (!user || (!isAdmin && user._id !== existingEvent.clubId)) {
            throw new apollo_server_1.ApolloError("Unauthorized: Only admin can Update this club");
        }
        try {
            const event = await calendar_schema_1.EventCalendarModel.findOneAndUpdate({ _id: eventId }, { $set: input }, { new: true });
            if (!event) {
                throw new apollo_server_1.ApolloError("Event not found or update failed");
            }
            return event;
        }
        catch (error) {
            logger_1.logger.error(error instanceof Error ? error.message : error);
            if (error instanceof apollo_server_1.ApolloError) {
                throw error;
            }
            throw new apollo_server_1.ApolloError("Internal server error ");
        }
    }
    async deleteEvent(user, eventId) {
        try {
            const isAdmin = user.role === "ADMIN";
            const existingEvent = await calendar_schema_1.EventCalendarModel.findById(eventId);
            if (!existingEvent) {
                throw new apollo_server_1.ApolloError("Event does not exit");
            }
            if (!user || (!isAdmin && user._id !== existingEvent.clubId)) {
                throw new apollo_server_1.ApolloError("Unauthorized: Only admin can delete this club");
            }
            const deletedEvent = await calendar_schema_1.EventCalendarModel.findByIdAndDelete(eventId).lean();
            return deletedEvent;
        }
        catch (error) {
            logger_1.logger.error(error instanceof Error ? error.message : error);
            if (error instanceof apollo_server_1.ApolloError) {
                throw error;
            }
            throw new apollo_server_1.ApolloError("Internal sever error ");
        }
    }
}
exports.CalendarService = CalendarService;
//# sourceMappingURL=calender.service.js.map