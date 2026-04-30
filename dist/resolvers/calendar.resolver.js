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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const type_graphql_1 = require("type-graphql");
const apollo_server_1 = require("apollo-server");
const s3Upload_1 = __importDefault(require("../utils/s3Upload"));
const calender_service_1 = require("../service/calender.service");
const calendar_schema_1 = require("../schema/calendar.schema");
let CalendarResolver = class CalendarResolver {
    constructor(calendarService) {
        this.calendarService = calendarService;
        this.calendarService = new calender_service_1.CalendarService();
    }
    async createEvent(context, input) {
        try {
            const { photo, entryForm, fileName, website } = input;
            const user = context.user;
            console.log("Resolver - Event type:", input.type);
            console.log("Resolver - NZFSSSanctioning input:", input.NZFSSSanctioning);
            input.NZFSSSanctioning = false;
            console.log("Resolver - NZFSSSanctioning after override:", input.NZFSSSanctioning);
            let uploadedFileUrl = null;
            let uploadPhoto = null;
            if (entryForm && fileName) {
                uploadedFileUrl = await (0, s3Upload_1.default)(entryForm, user._id, "uploads/event/");
            }
            else if (!entryForm && !fileName && website) {
                uploadedFileUrl = website;
            }
            if (photo && photo.trim() !== '') {
                uploadPhoto = await (0, s3Upload_1.default)(photo, user._id, "uploads/photo/");
            }
            const eventData = {
                ...input,
                entryForm: uploadedFileUrl,
                photo: uploadPhoto
            };
            eventData.NZFSSSanctioning = false;
            console.log("Resolver - Final NZFSSSanctioning:", eventData.NZFSSSanctioning);
            return await this.calendarService.createCalendar(eventData);
        }
        catch (error) {
            console.error("Error in createEvent:", error);
            throw new apollo_server_1.ApolloError(`Error creating event: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }
    async getAllEvents(context) {
        const user = context.user;
        return await this.calendarService.getAllCalendarEvents(user);
    }
    async getEventsWithResults(context) {
        const user = context.user;
        return await this.calendarService.getEventsWithResults(user);
    }
    async findEventCalendarById(input, context) {
        console.log(`Resolver: Finding event with ID: ${input._id}`);
        const user = context.user;
        const event = await this.calendarService.findEventCalendarById(input, user);
        if (event) {
            console.log(`Resolver: Returning event data for ${event.eventName}`);
            console.log(`Resolver: Event club: ${event.club}, type: ${event.type}, region: ${event.region}`);
        }
        else {
            console.log(`Resolver: No event found`);
        }
        return event;
    }
    async updateEventCalendar(context, eventId, input) {
        try {
            const { photo, entryForm, ...otherFields } = input;
            console.log("UPDATE EVENT - Raw photo input:", photo === null ? "NULL" : photo === undefined ? "UNDEFINED" : `string with length ${photo.length}`);
            console.log("UPDATE EVENT - Photo input prefix:", photo ? photo.substring(0, 50) : `no photo (${photo})`);
            const user = context.user;
            let uploadedFileUrl = null;
            let uploadPhoto = null;
            if (entryForm) {
                console.log("UPDATE EVENT - Uploading entry form to S3...");
                uploadedFileUrl = await (0, s3Upload_1.default)(entryForm, user._id, "uploads/event/");
                console.log("UPDATE EVENT - Entry form uploaded to:", uploadedFileUrl);
                if (!uploadedFileUrl) {
                    throw new apollo_server_1.ApolloError("Error uploading the file.");
                }
            }
            if (photo && typeof photo === 'string' && photo.trim() !== '' && photo !== 'null') {
                console.log("UPDATE EVENT - Uploading photo to S3...");
                uploadPhoto = await (0, s3Upload_1.default)(photo, user._id, "uploads/photo/");
                console.log("UPDATE EVENT - Photo uploaded to:", uploadPhoto);
            }
            else if (photo === null || photo === 'null' || photo === '') {
                console.log("UPDATE EVENT - Photo deletion requested (null/empty value)");
                uploadPhoto = null;
            }
            else {
                console.log("UPDATE EVENT - No photo processing needed");
            }
            const formData = { ...otherFields };
            if (uploadedFileUrl) {
                formData.entryForm = uploadedFileUrl;
            }
            if (uploadPhoto) {
                formData.photo = uploadPhoto;
            }
            else if (photo === null || photo === 'null' || photo === '') {
                console.log("UPDATE EVENT - Including photo deletion in formData");
                formData.photo = null;
            }
            console.log("UPDATE EVENT - Final formData photo:", formData.photo);
            console.log("UPDATE EVENT - formData has photo field:", 'photo' in formData);
            console.log("UPDATE EVENT - Complete formData keys:", Object.keys(formData));
            return await this.calendarService.updateEventCalendar(formData, user, eventId);
        }
        catch (error) {
            console.error("UPDATE EVENT - Error:", error);
            throw new apollo_server_1.ApolloError("Internal server error: " + error);
        }
    }
    async deleteEvent(context, eventId) {
        const user = context.user;
        if (!user) {
            throw new apollo_server_1.ApolloError("Unauthorized: User is not authenticated");
        }
        return await this.calendarService.deleteEvent(user, eventId);
    }
};
__decorate([
    (0, type_graphql_1.Authorized)(),
    (0, type_graphql_1.Mutation)(() => calendar_schema_1.EventCalendar),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("input")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, calendar_schema_1.CreateEventCalendarInput]),
    __metadata("design:returntype", Promise)
], CalendarResolver.prototype, "createEvent", null);
__decorate([
    (0, type_graphql_1.Query)(() => [calendar_schema_1.EventCalendar], { nullable: true }),
    __param(0, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CalendarResolver.prototype, "getAllEvents", null);
__decorate([
    (0, type_graphql_1.Query)(() => [calendar_schema_1.EventCalendar], { nullable: true }),
    __param(0, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CalendarResolver.prototype, "getEventsWithResults", null);
__decorate([
    (0, type_graphql_1.Query)(() => calendar_schema_1.EventCalendar, { nullable: true }),
    __param(0, (0, type_graphql_1.Arg)("input")),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [calendar_schema_1.FindEventCalendarByIdInput, Object]),
    __metadata("design:returntype", Promise)
], CalendarResolver.prototype, "findEventCalendarById", null);
__decorate([
    (0, type_graphql_1.Authorized)(),
    (0, type_graphql_1.Mutation)(() => calendar_schema_1.EventCalendar),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("eventId")),
    __param(2, (0, type_graphql_1.Arg)("input")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, calendar_schema_1.UpdateEventCalendarInput]),
    __metadata("design:returntype", Promise)
], CalendarResolver.prototype, "updateEventCalendar", null);
__decorate([
    (0, type_graphql_1.Authorized)(),
    (0, type_graphql_1.Mutation)(() => calendar_schema_1.EventCalendar),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("eventId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CalendarResolver.prototype, "deleteEvent", null);
CalendarResolver = __decorate([
    (0, type_graphql_1.Resolver)(),
    __metadata("design:paramtypes", [calender_service_1.CalendarService])
], CalendarResolver);
exports.default = CalendarResolver;
//# sourceMappingURL=calendar.resolver.js.map