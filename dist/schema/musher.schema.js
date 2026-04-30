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
exports.UpdateMusherInput = exports.CreateMusherInput = exports.Musher = exports.DogInput = void 0;
const type_graphql_1 = require("type-graphql");
const typegoose_1 = require("@typegoose/typegoose");
const club_schema_1 = require("./club.schema");
let Dog = class Dog {
};
__decorate([
    (0, type_graphql_1.Field)(() => String),
    (0, typegoose_1.prop)({ required: true }),
    __metadata("design:type", String)
], Dog.prototype, "_id", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    (0, typegoose_1.prop)({ required: false }),
    __metadata("design:type", String)
], Dog.prototype, "name", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    (0, typegoose_1.prop)({ type: String }),
    __metadata("design:type", String)
], Dog.prototype, "pedigreeName", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    (0, typegoose_1.prop)({ type: String }),
    __metadata("design:type", String)
], Dog.prototype, "nzkcNo", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    (0, typegoose_1.prop)({ type: String }),
    __metadata("design:type", String)
], Dog.prototype, "nzfssNo", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    (0, typegoose_1.prop)({ type: String, required: false, default: "N/A" }),
    __metadata("design:type", String)
], Dog.prototype, "dateOfBirth", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    (0, typegoose_1.prop)({ type: String, required: false, default: "N/A" }),
    __metadata("design:type", String)
], Dog.prototype, "breed", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Boolean),
    (0, typegoose_1.prop)({ type: Boolean, default: false }),
    __metadata("design:type", Boolean)
], Dog.prototype, "deceased", void 0);
Dog = __decorate([
    (0, type_graphql_1.ObjectType)("DogType")
], Dog);
let DogInput = class DogInput {
};
exports.DogInput = DogInput;
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], DogInput.prototype, "_id", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], DogInput.prototype, "name", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], DogInput.prototype, "pedigreeName", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], DogInput.prototype, "nzkcNo", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], DogInput.prototype, "nzfssNo", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], DogInput.prototype, "dob", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], DogInput.prototype, "dateOfBirth", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], DogInput.prototype, "breed", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Boolean, { nullable: false }),
    __metadata("design:type", Boolean)
], DogInput.prototype, "deceased", void 0);
exports.DogInput = DogInput = __decorate([
    (0, type_graphql_1.InputType)("MusherDogInput")
], DogInput);
let Musher = class Musher {
};
exports.Musher = Musher;
__decorate([
    (0, type_graphql_1.Field)(() => String),
    __metadata("design:type", String)
], Musher.prototype, "id", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    (0, typegoose_1.prop)({ required: true }),
    __metadata("design:type", String)
], Musher.prototype, "name", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    (0, typegoose_1.prop)({ required: false }),
    __metadata("design:type", String)
], Musher.prototype, "registrationNo", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    (0, typegoose_1.prop)({ required: false }),
    __metadata("design:type", String)
], Musher.prototype, "kennelRegistrationNo", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    (0, typegoose_1.prop)({ required: true, ref: () => club_schema_1.Club, type: () => String }),
    __metadata("design:type", Object)
], Musher.prototype, "club", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => [Dog]),
    (0, typegoose_1.prop)({ type: () => [Dog] }),
    __metadata("design:type", Array)
], Musher.prototype, "dogs", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Boolean, { nullable: true }),
    (0, typegoose_1.prop)({ type: Boolean, default: false }),
    __metadata("design:type", Boolean)
], Musher.prototype, "showProfileConsent", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Date),
    (0, typegoose_1.prop)({ type: Date }),
    __metadata("design:type", Date)
], Musher.prototype, "createdAt", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Date),
    (0, typegoose_1.prop)({ type: Date }),
    __metadata("design:type", Date)
], Musher.prototype, "updatedAt", void 0);
exports.Musher = Musher = __decorate([
    (0, type_graphql_1.ObjectType)()
], Musher);
let CreateMusherInput = class CreateMusherInput {
};
exports.CreateMusherInput = CreateMusherInput;
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], CreateMusherInput.prototype, "name", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreateMusherInput.prototype, "registrationNo", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreateMusherInput.prototype, "kennelRegistrationNo", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    __metadata("design:type", String)
], CreateMusherInput.prototype, "clubId", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => [DogInput]),
    __metadata("design:type", Array)
], CreateMusherInput.prototype, "dogs", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Boolean, { nullable: true }),
    __metadata("design:type", Boolean)
], CreateMusherInput.prototype, "showProfileConsent", void 0);
exports.CreateMusherInput = CreateMusherInput = __decorate([
    (0, type_graphql_1.InputType)("CreateMusherInput")
], CreateMusherInput);
let UpdateMusherInput = class UpdateMusherInput {
};
exports.UpdateMusherInput = UpdateMusherInput;
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateMusherInput.prototype, "name", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateMusherInput.prototype, "registrationNo", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateMusherInput.prototype, "kennelRegistrationNo", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], UpdateMusherInput.prototype, "clubId", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => [DogInput], { nullable: true }),
    __metadata("design:type", Array)
], UpdateMusherInput.prototype, "dogs", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Boolean, { nullable: true }),
    __metadata("design:type", Boolean)
], UpdateMusherInput.prototype, "showProfileConsent", void 0);
exports.UpdateMusherInput = UpdateMusherInput = __decorate([
    (0, type_graphql_1.InputType)()
], UpdateMusherInput);
//# sourceMappingURL=musher.schema.js.map