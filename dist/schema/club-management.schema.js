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
exports.FindClubManagementByIdInput = exports.UpdateClubManagementInput = exports.CreateClubManagementInput = exports.ClubManagement = exports.ClubForm = exports.Driver = exports.Location = exports.Gallery = exports.Service = exports.WhoWeAreSection = exports.ClubStatistic = void 0;
const type_graphql_1 = require("type-graphql");
const typegoose_1 = require("@typegoose/typegoose");
const class_validator_1 = require("class-validator");
let ClubStatistic = class ClubStatistic {
};
exports.ClubStatistic = ClubStatistic;
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    (0, typegoose_1.prop)({ required: false }),
    __metadata("design:type", String)
], ClubStatistic.prototype, "name", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    (0, typegoose_1.prop)({ required: false }),
    __metadata("design:type", String)
], ClubStatistic.prototype, "icon", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    (0, typegoose_1.prop)({ default: false }),
    __metadata("design:type", Boolean)
], ClubStatistic.prototype, "isCustomIcon", void 0);
exports.ClubStatistic = ClubStatistic = __decorate([
    (0, type_graphql_1.ObjectType)()
], ClubStatistic);
let WhoWeAreSection = class WhoWeAreSection {
};
exports.WhoWeAreSection = WhoWeAreSection;
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    (0, typegoose_1.prop)({ required: false }),
    __metadata("design:type", String)
], WhoWeAreSection.prototype, "description", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => [String], { nullable: true }),
    (0, typegoose_1.prop)({ type: () => [String], required: false }),
    __metadata("design:type", Array)
], WhoWeAreSection.prototype, "images", void 0);
exports.WhoWeAreSection = WhoWeAreSection = __decorate([
    (0, type_graphql_1.ObjectType)()
], WhoWeAreSection);
let Service = class Service {
};
exports.Service = Service;
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    (0, typegoose_1.prop)({ required: false }),
    __metadata("design:type", String)
], Service.prototype, "name", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    (0, typegoose_1.prop)({ required: false }),
    __metadata("design:type", String)
], Service.prototype, "image", void 0);
exports.Service = Service = __decorate([
    (0, type_graphql_1.ObjectType)()
], Service);
let Gallery = class Gallery {
};
exports.Gallery = Gallery;
__decorate([
    (0, type_graphql_1.Field)(() => [String], { nullable: true }),
    (0, typegoose_1.prop)({ type: () => [String], required: false }),
    __metadata("design:type", Array)
], Gallery.prototype, "images", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => [String], { nullable: true }),
    (0, typegoose_1.prop)({ type: () => [String], required: false }),
    __metadata("design:type", Array)
], Gallery.prototype, "videos", void 0);
exports.Gallery = Gallery = __decorate([
    (0, type_graphql_1.ObjectType)()
], Gallery);
let Coordinates = class Coordinates {
};
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    (0, typegoose_1.prop)({ required: false }),
    __metadata("design:type", Number)
], Coordinates.prototype, "lat", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    (0, typegoose_1.prop)({ required: false }),
    __metadata("design:type", Number)
], Coordinates.prototype, "lng", void 0);
Coordinates = __decorate([
    (0, type_graphql_1.ObjectType)()
], Coordinates);
let Location = class Location {
};
exports.Location = Location;
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    (0, typegoose_1.prop)({ required: false }),
    __metadata("design:type", String)
], Location.prototype, "description", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    (0, typegoose_1.prop)({ required: false }),
    __metadata("design:type", String)
], Location.prototype, "address", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    (0, typegoose_1.prop)({ required: false }),
    __metadata("design:type", String)
], Location.prototype, "image", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Coordinates, { nullable: true }),
    (0, typegoose_1.prop)({ type: () => Coordinates, required: false }),
    __metadata("design:type", Coordinates)
], Location.prototype, "coordinates", void 0);
exports.Location = Location = __decorate([
    (0, type_graphql_1.ObjectType)()
], Location);
let Driver = class Driver {
};
exports.Driver = Driver;
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    (0, typegoose_1.prop)({ required: false }),
    __metadata("design:type", String)
], Driver.prototype, "name", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    (0, typegoose_1.prop)({ required: false }),
    __metadata("design:type", String)
], Driver.prototype, "image", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    (0, typegoose_1.prop)({ required: false }),
    __metadata("design:type", String)
], Driver.prototype, "nzfssRR", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    (0, typegoose_1.prop)({ required: false }),
    __metadata("design:type", String)
], Driver.prototype, "ipssRR", void 0);
exports.Driver = Driver = __decorate([
    (0, type_graphql_1.ObjectType)()
], Driver);
let ClubForm = class ClubForm {
};
exports.ClubForm = ClubForm;
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    (0, typegoose_1.prop)({ required: false }),
    __metadata("design:type", String)
], ClubForm.prototype, "fileName", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    (0, typegoose_1.prop)({ required: false }),
    __metadata("design:type", String)
], ClubForm.prototype, "fileType", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    (0, typegoose_1.prop)({ required: false }),
    __metadata("design:type", Number)
], ClubForm.prototype, "fileSize", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    (0, typegoose_1.prop)({ required: false }),
    __metadata("design:type", String)
], ClubForm.prototype, "fileData", void 0);
exports.ClubForm = ClubForm = __decorate([
    (0, type_graphql_1.ObjectType)()
], ClubForm);
let ClubManagement = class ClubManagement {
};
exports.ClubManagement = ClubManagement;
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    (0, typegoose_1.prop)({ required: false }),
    __metadata("design:type", String)
], ClubManagement.prototype, "clubName", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    (0, typegoose_1.prop)({ required: false }),
    __metadata("design:type", String)
], ClubManagement.prototype, "shortDescription", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    (0, typegoose_1.prop)({ required: false }),
    __metadata("design:type", String)
], ClubManagement.prototype, "clubLogo", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    (0, typegoose_1.prop)({ required: false }),
    __metadata("design:type", String)
], ClubManagement.prototype, "coverImage", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => [ClubStatistic], { nullable: true }),
    (0, typegoose_1.prop)({ type: () => [ClubStatistic], required: false }),
    __metadata("design:type", Array)
], ClubManagement.prototype, "statistics", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => [WhoWeAreSection], { nullable: true }),
    (0, typegoose_1.prop)({ type: () => [WhoWeAreSection], required: false }),
    __metadata("design:type", Array)
], ClubManagement.prototype, "whoWeAre", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => [Service], { nullable: true }),
    (0, typegoose_1.prop)({ type: () => [Service], required: false }),
    __metadata("design:type", Array)
], ClubManagement.prototype, "services", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Gallery, { nullable: true }),
    (0, typegoose_1.prop)({ type: () => Gallery, required: false }),
    __metadata("design:type", Gallery)
], ClubManagement.prototype, "gallery", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Location, { nullable: true }),
    (0, typegoose_1.prop)({ type: () => Location, required: false }),
    __metadata("design:type", Location)
], ClubManagement.prototype, "location", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => [Driver], { nullable: true }),
    (0, typegoose_1.prop)({ type: () => [Driver], required: false }),
    __metadata("design:type", Array)
], ClubManagement.prototype, "drivers", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => [ClubForm], { nullable: true }),
    (0, typegoose_1.prop)({ type: () => [ClubForm], required: false }),
    __metadata("design:type", Array)
], ClubManagement.prototype, "forms", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    (0, typegoose_1.prop)({ required: false }),
    __metadata("design:type", String)
], ClubManagement.prototype, "createdBy", void 0);
exports.ClubManagement = ClubManagement = __decorate([
    (0, type_graphql_1.ObjectType)()
], ClubManagement);
let ClubStatisticInput = class ClubStatisticInput {
};
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ClubStatisticInput.prototype, "name", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ClubStatisticInput.prototype, "icon", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], ClubStatisticInput.prototype, "isCustomIcon", void 0);
ClubStatisticInput = __decorate([
    (0, type_graphql_1.InputType)()
], ClubStatisticInput);
let WhoWeAreSectionInput = class WhoWeAreSectionInput {
};
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], WhoWeAreSectionInput.prototype, "description", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => [String], { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], WhoWeAreSectionInput.prototype, "images", void 0);
WhoWeAreSectionInput = __decorate([
    (0, type_graphql_1.InputType)()
], WhoWeAreSectionInput);
let ServiceInput = class ServiceInput {
};
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ServiceInput.prototype, "name", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ServiceInput.prototype, "image", void 0);
ServiceInput = __decorate([
    (0, type_graphql_1.InputType)()
], ServiceInput);
let GalleryInput = class GalleryInput {
};
__decorate([
    (0, type_graphql_1.Field)(() => [String], { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], GalleryInput.prototype, "images", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => [String], { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], GalleryInput.prototype, "videos", void 0);
GalleryInput = __decorate([
    (0, type_graphql_1.InputType)()
], GalleryInput);
let CoordinatesInput = class CoordinatesInput {
};
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CoordinatesInput.prototype, "lat", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CoordinatesInput.prototype, "lng", void 0);
CoordinatesInput = __decorate([
    (0, type_graphql_1.InputType)()
], CoordinatesInput);
let LocationInput = class LocationInput {
};
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LocationInput.prototype, "description", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LocationInput.prototype, "address", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LocationInput.prototype, "image", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => CoordinatesInput, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", CoordinatesInput)
], LocationInput.prototype, "coordinates", void 0);
LocationInput = __decorate([
    (0, type_graphql_1.InputType)()
], LocationInput);
let DriverInput = class DriverInput {
};
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DriverInput.prototype, "name", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], DriverInput.prototype, "image", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DriverInput.prototype, "nzfssRR", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DriverInput.prototype, "ipssRR", void 0);
DriverInput = __decorate([
    (0, type_graphql_1.InputType)()
], DriverInput);
let ClubFormInput = class ClubFormInput {
};
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ClubFormInput.prototype, "fileName", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ClubFormInput.prototype, "fileType", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], ClubFormInput.prototype, "fileSize", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ClubFormInput.prototype, "fileData", void 0);
ClubFormInput = __decorate([
    (0, type_graphql_1.InputType)()
], ClubFormInput);
let CreateClubManagementInput = class CreateClubManagementInput {
};
exports.CreateClubManagementInput = CreateClubManagementInput;
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateClubManagementInput.prototype, "clubName", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateClubManagementInput.prototype, "shortDescription", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateClubManagementInput.prototype, "clubLogo", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateClubManagementInput.prototype, "coverImage", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => [ClubStatisticInput], { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateClubManagementInput.prototype, "statistics", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => [WhoWeAreSectionInput], { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateClubManagementInput.prototype, "whoWeAre", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => [ServiceInput], { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateClubManagementInput.prototype, "services", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => GalleryInput, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", GalleryInput)
], CreateClubManagementInput.prototype, "gallery", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => LocationInput, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", LocationInput)
], CreateClubManagementInput.prototype, "location", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => [DriverInput], { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateClubManagementInput.prototype, "drivers", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => [ClubFormInput], { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateClubManagementInput.prototype, "forms", void 0);
exports.CreateClubManagementInput = CreateClubManagementInput = __decorate([
    (0, type_graphql_1.InputType)()
], CreateClubManagementInput);
let UpdateClubManagementInput = class UpdateClubManagementInput extends CreateClubManagementInput {
};
exports.UpdateClubManagementInput = UpdateClubManagementInput;
exports.UpdateClubManagementInput = UpdateClubManagementInput = __decorate([
    (0, type_graphql_1.InputType)()
], UpdateClubManagementInput);
let FindClubManagementByIdInput = class FindClubManagementByIdInput {
};
exports.FindClubManagementByIdInput = FindClubManagementByIdInput;
__decorate([
    (0, type_graphql_1.Field)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FindClubManagementByIdInput.prototype, "clubId", void 0);
exports.FindClubManagementByIdInput = FindClubManagementByIdInput = __decorate([
    (0, type_graphql_1.InputType)()
], FindClubManagementByIdInput);
//# sourceMappingURL=club-management.schema.js.map