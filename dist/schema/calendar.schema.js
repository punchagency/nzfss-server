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
Object.defineProperty(exports, "__esModule", { value: true });
exports.FindEventCalendarByIdInput = exports.UpdateEventCalendarInput = exports.CreateEventCalendarInput = exports.EventCalendarModel = exports.EventCalendar = exports.Status = void 0;
const typegoose_1 = require("@typegoose/typegoose");
const type_graphql_1 = require("type-graphql");
var Status;
(function (Status) {
    Status["Pending"] = "Pending";
    Status["Approve"] = "Approve";
    Status["Declined"] = "Declined";
})(Status || (exports.Status = Status = {}));
(0, type_graphql_1.registerEnumType)(Status, {
    name: "Status",
});
let EventCalendar = class EventCalendar {
};
exports.EventCalendar = EventCalendar;
__decorate([
    (0, type_graphql_1.Field)(() => String),
    __metadata("design:type", String)
], EventCalendar.prototype, "_id", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    (0, typegoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], EventCalendar.prototype, "preferredDate", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    (0, typegoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], EventCalendar.prototype, "alternativeDate", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Boolean),
    (0, typegoose_1.Prop)({ required: true, default: false }),
    __metadata("design:type", Boolean)
], EventCalendar.prototype, "date", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Boolean),
    (0, typegoose_1.Prop)({ required: true, default: false }),
    __metadata("design:type", Boolean)
], EventCalendar.prototype, "NZFSSSanctioning", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Boolean),
    (0, typegoose_1.Prop)({ required: true, default: false }),
    __metadata("design:type", Boolean)
], EventCalendar.prototype, "public", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Boolean),
    (0, typegoose_1.Prop)({ required: true, default: false }),
    __metadata("design:type", Boolean)
], EventCalendar.prototype, "isSubmitted", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Status),
    (0, typegoose_1.Prop)({ required: true, default: Status.Pending }),
    __metadata("design:type", String)
], EventCalendar.prototype, "status", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    (0, typegoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], EventCalendar.prototype, "eventName", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    (0, typegoose_1.Prop)({ required: false }),
    __metadata("design:type", String)
], EventCalendar.prototype, "eventDate", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    (0, typegoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], EventCalendar.prototype, "club", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    (0, typegoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], EventCalendar.prototype, "region", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    (0, typegoose_1.Prop)({ required: false }),
    __metadata("design:type", String)
], EventCalendar.prototype, "entryForm", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    (0, typegoose_1.Prop)({ required: false }),
    __metadata("design:type", String)
], EventCalendar.prototype, "fileName", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    (0, typegoose_1.Prop)({ required: false }),
    __metadata("design:type", String)
], EventCalendar.prototype, "website", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    (0, typegoose_1.Prop)({ required: false }),
    __metadata("design:type", String)
], EventCalendar.prototype, "reason", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    (0, typegoose_1.Prop)({ required: false }),
    __metadata("design:type", String)
], EventCalendar.prototype, "photo", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    (0, typegoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], EventCalendar.prototype, "type", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Boolean),
    (0, typegoose_1.Prop)({ required: true, default: false }),
    __metadata("design:type", Boolean)
], EventCalendar.prototype, "result", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Date, { nullable: true }),
    (0, typegoose_1.Prop)({ required: false, default: Date.now }),
    __metadata("design:type", Date)
], EventCalendar.prototype, "createdAt", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    (0, typegoose_1.Prop)({ required: true, ref: "User" }),
    __metadata("design:type", String)
], EventCalendar.prototype, "clubId", void 0);
exports.EventCalendar = EventCalendar = __decorate([
    (0, type_graphql_1.ObjectType)()
], EventCalendar);
exports.EventCalendarModel = (0, typegoose_1.getModelForClass)(EventCalendar);
let CreateEventCalendarInput = class CreateEventCalendarInput {
};
exports.CreateEventCalendarInput = CreateEventCalendarInput;
__decorate([
    (0, type_graphql_1.Field)(() => String),
    __metadata("design:type", String)
], CreateEventCalendarInput.prototype, "preferredDate", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    __metadata("design:type", String)
], CreateEventCalendarInput.prototype, "alternativeDate", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    __metadata("design:type", String)
], CreateEventCalendarInput.prototype, "eventName", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    __metadata("design:type", String)
], CreateEventCalendarInput.prototype, "eventDate", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    __metadata("design:type", String)
], CreateEventCalendarInput.prototype, "club", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    __metadata("design:type", String)
], CreateEventCalendarInput.prototype, "region", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreateEventCalendarInput.prototype, "photo", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreateEventCalendarInput.prototype, "entryForm", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreateEventCalendarInput.prototype, "fileName", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    __metadata("design:type", String)
], CreateEventCalendarInput.prototype, "type", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    __metadata("design:type", String)
], CreateEventCalendarInput.prototype, "clubId", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreateEventCalendarInput.prototype, "website", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreateEventCalendarInput.prototype, "reason", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Boolean),
    __metadata("design:type", Boolean)
], CreateEventCalendarInput.prototype, "date", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Boolean),
    __metadata("design:type", Boolean)
], CreateEventCalendarInput.prototype, "NZFSSSanctioning", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Boolean),
    __metadata("design:type", Boolean)
], CreateEventCalendarInput.prototype, "public", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Status),
    __metadata("design:type", String)
], CreateEventCalendarInput.prototype, "status", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Boolean),
    __metadata("design:type", Boolean)
], CreateEventCalendarInput.prototype, "isSubmitted", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Boolean),
    __metadata("design:type", Boolean)
], CreateEventCalendarInput.prototype, "result", void 0);
exports.CreateEventCalendarInput = CreateEventCalendarInput = __decorate([
    (0, type_graphql_1.InputType)()
], CreateEventCalendarInput);
let UpdateEventCalendarInput = class UpdateEventCalendarInput {
};
exports.UpdateEventCalendarInput = UpdateEventCalendarInput;
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], UpdateEventCalendarInput.prototype, "preferredDate", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], UpdateEventCalendarInput.prototype, "alternativeDate", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Boolean, { nullable: true }),
    __metadata("design:type", Boolean)
], UpdateEventCalendarInput.prototype, "date", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Boolean, { nullable: true }),
    __metadata("design:type", Boolean)
], UpdateEventCalendarInput.prototype, "NZFSSSanctioning", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Boolean, { nullable: true }),
    __metadata("design:type", Boolean)
], UpdateEventCalendarInput.prototype, "public", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Boolean, { nullable: true }),
    __metadata("design:type", Boolean)
], UpdateEventCalendarInput.prototype, "isSubmitted", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Status, { nullable: true }),
    __metadata("design:type", String)
], UpdateEventCalendarInput.prototype, "status", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], UpdateEventCalendarInput.prototype, "eventName", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], UpdateEventCalendarInput.prototype, "eventDate", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], UpdateEventCalendarInput.prototype, "club", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], UpdateEventCalendarInput.prototype, "clubId", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], UpdateEventCalendarInput.prototype, "region", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], UpdateEventCalendarInput.prototype, "entryForm", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], UpdateEventCalendarInput.prototype, "fileName", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], UpdateEventCalendarInput.prototype, "photo", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], UpdateEventCalendarInput.prototype, "type", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Boolean, { nullable: true }),
    __metadata("design:type", Boolean)
], UpdateEventCalendarInput.prototype, "result", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], UpdateEventCalendarInput.prototype, "website", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], UpdateEventCalendarInput.prototype, "reason", void 0);
exports.UpdateEventCalendarInput = UpdateEventCalendarInput = __decorate([
    (0, type_graphql_1.InputType)()
], UpdateEventCalendarInput);
let FindEventCalendarByIdInput = class FindEventCalendarByIdInput {
};
exports.FindEventCalendarByIdInput = FindEventCalendarByIdInput;
__decorate([
    (0, type_graphql_1.Field)(() => String),
    __metadata("design:type", String)
], FindEventCalendarByIdInput.prototype, "_id", void 0);
exports.FindEventCalendarByIdInput = FindEventCalendarByIdInput = __decorate([
    (0, type_graphql_1.InputType)()
], FindEventCalendarByIdInput);
//# sourceMappingURL=calendar.schema.js.map