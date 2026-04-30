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
exports.FindEntrantByIdInput = exports.UpdateEntrantInput = exports.CreateEntrantInput = exports.EntrantModel = exports.Entrants = exports.Dog = void 0;
const typegoose_1 = require("@typegoose/typegoose");
const type_graphql_1 = require("type-graphql");
const user_schema_1 = require("./user.schema");
const calendar_schema_1 = require("./calendar.schema");
const heat_schema_1 = require("./heat.schema");
let Dog = class Dog {
};
exports.Dog = Dog;
__decorate([
    (0, type_graphql_1.Field)(() => String),
    (0, typegoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Dog.prototype, "driverName", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    (0, typegoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Dog.prototype, "name", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    (0, typegoose_1.Prop)({ required: false }),
    __metadata("design:type", String)
], Dog.prototype, "NZFSSRegistration", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    (0, typegoose_1.Prop)({ required: false }),
    __metadata("design:type", String)
], Dog.prototype, "dob", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    (0, typegoose_1.Prop)({ required: false }),
    __metadata("design:type", String)
], Dog.prototype, "breed", void 0);
exports.Dog = Dog = __decorate([
    (0, type_graphql_1.ObjectType)(),
    (0, type_graphql_1.InputType)("DogInput")
], Dog);
let Entrants = class Entrants {
};
exports.Entrants = Entrants;
__decorate([
    (0, type_graphql_1.Field)(() => String),
    __metadata("design:type", String)
], Entrants.prototype, "_id", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    (0, typegoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Entrants.prototype, "raceFormat", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    (0, typegoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Entrants.prototype, "class", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    (0, typegoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Entrants.prototype, "customClass", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    (0, typegoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Entrants.prototype, "name", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => [Dog]),
    (0, typegoose_1.Prop)({ required: true, type: () => [Dog] }),
    __metadata("design:type", Array)
], Entrants.prototype, "associatedDog", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    (0, typegoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Entrants.prototype, "raceType", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    (0, typegoose_1.Prop)({ required: false }),
    __metadata("design:type", String)
], Entrants.prototype, "startTime", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    (0, typegoose_1.Prop)({ required: false }),
    __metadata("design:type", String)
], Entrants.prototype, "raceTime", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    (0, typegoose_1.Prop)({ required: false }),
    __metadata("design:type", String)
], Entrants.prototype, "cutoffTime", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    (0, typegoose_1.Prop)({ required: true, ref: () => user_schema_1.User }),
    __metadata("design:type", Object)
], Entrants.prototype, "userId", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    (0, typegoose_1.Prop)({ required: true, ref: () => calendar_schema_1.EventCalendar }),
    __metadata("design:type", Object)
], Entrants.prototype, "eventId", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    (0, typegoose_1.Prop)({ required: false }),
    __metadata("design:type", String)
], Entrants.prototype, "temperature", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    (0, typegoose_1.Prop)({ required: false }),
    __metadata("design:type", String)
], Entrants.prototype, "distance", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    (0, typegoose_1.Prop)({ required: false }),
    __metadata("design:type", String)
], Entrants.prototype, "heat", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => [heat_schema_1.HeatData], { nullable: true }),
    (0, typegoose_1.Prop)({ required: false, type: () => [heat_schema_1.HeatData] }),
    __metadata("design:type", Array)
], Entrants.prototype, "heatsData", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    (0, typegoose_1.Prop)({ required: false }),
    __metadata("design:type", String)
], Entrants.prototype, "dogWeight", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    (0, typegoose_1.Prop)({ required: false }),
    __metadata("design:type", String)
], Entrants.prototype, "weightPulled", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Date, { nullable: true }),
    (0, typegoose_1.Prop)({ required: true, default: Date.now }),
    __metadata("design:type", Date)
], Entrants.prototype, "createdAt", void 0);
exports.Entrants = Entrants = __decorate([
    (0, type_graphql_1.ObjectType)()
], Entrants);
exports.EntrantModel = (0, typegoose_1.getModelForClass)(Entrants);
let CreateEntrantInput = class CreateEntrantInput {
};
exports.CreateEntrantInput = CreateEntrantInput;
__decorate([
    (0, type_graphql_1.Field)(() => String),
    __metadata("design:type", String)
], CreateEntrantInput.prototype, "name", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    __metadata("design:type", String)
], CreateEntrantInput.prototype, "raceFormat", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    __metadata("design:type", String)
], CreateEntrantInput.prototype, "class", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    __metadata("design:type", String)
], CreateEntrantInput.prototype, "customClass", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => [Dog]),
    __metadata("design:type", Array)
], CreateEntrantInput.prototype, "associatedDog", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    __metadata("design:type", String)
], CreateEntrantInput.prototype, "raceType", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], CreateEntrantInput.prototype, "startTime", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], CreateEntrantInput.prototype, "raceTime", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], CreateEntrantInput.prototype, "cutoffTime", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    __metadata("design:type", String)
], CreateEntrantInput.prototype, "eventId", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], CreateEntrantInput.prototype, "temperature", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], CreateEntrantInput.prototype, "distance", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], CreateEntrantInput.prototype, "heat", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => [heat_schema_1.HeatData], { nullable: true }),
    __metadata("design:type", Array)
], CreateEntrantInput.prototype, "heatsData", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], CreateEntrantInput.prototype, "dogWeight", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], CreateEntrantInput.prototype, "weightPulled", void 0);
exports.CreateEntrantInput = CreateEntrantInput = __decorate([
    (0, type_graphql_1.InputType)()
], CreateEntrantInput);
let UpdateEntrantInput = class UpdateEntrantInput {
};
exports.UpdateEntrantInput = UpdateEntrantInput;
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateEntrantInput.prototype, "name", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => [Dog], { nullable: true }),
    __metadata("design:type", Array)
], UpdateEntrantInput.prototype, "associatedDog", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateEntrantInput.prototype, "raceFormat", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateEntrantInput.prototype, "class", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateEntrantInput.prototype, "customClass", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateEntrantInput.prototype, "raceType", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateEntrantInput.prototype, "startTime", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateEntrantInput.prototype, "raceTime", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateEntrantInput.prototype, "cutoffTime", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateEntrantInput.prototype, "temperature", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateEntrantInput.prototype, "distance", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateEntrantInput.prototype, "heat", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => [heat_schema_1.HeatData], { nullable: true }),
    __metadata("design:type", Array)
], UpdateEntrantInput.prototype, "heatsData", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateEntrantInput.prototype, "dogWeight", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateEntrantInput.prototype, "weightPulled", void 0);
exports.UpdateEntrantInput = UpdateEntrantInput = __decorate([
    (0, type_graphql_1.InputType)()
], UpdateEntrantInput);
let FindEntrantByIdInput = class FindEntrantByIdInput {
};
exports.FindEntrantByIdInput = FindEntrantByIdInput;
__decorate([
    (0, type_graphql_1.Field)(() => String),
    __metadata("design:type", String)
], FindEntrantByIdInput.prototype, "_id", void 0);
exports.FindEntrantByIdInput = FindEntrantByIdInput = __decorate([
    (0, type_graphql_1.InputType)()
], FindEntrantByIdInput);
//# sourceMappingURL=entrants.schema.js.map