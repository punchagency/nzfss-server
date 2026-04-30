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
exports.FindFormByIdInput = exports.UpdateFormInput = exports.CreateFormInput = exports.DogInput = exports.FormModel = exports.Form = exports.DogInfo = void 0;
const typegoose_1 = require("@typegoose/typegoose");
const type_graphql_1 = require("type-graphql");
let DogInfo = class DogInfo {
};
exports.DogInfo = DogInfo;
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    (0, typegoose_1.Prop)({ required: false }),
    __metadata("design:type", String)
], DogInfo.prototype, "petName", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Boolean, { nullable: true }),
    (0, typegoose_1.Prop)({ required: false, default: false }),
    __metadata("design:type", Boolean)
], DogInfo.prototype, "isDeceased", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    (0, typegoose_1.Prop)({ required: false }),
    __metadata("design:type", String)
], DogInfo.prototype, "nzfssNumber", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    (0, typegoose_1.Prop)({ required: false }),
    __metadata("design:type", String)
], DogInfo.prototype, "pedigreeName", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    (0, typegoose_1.Prop)({ required: false }),
    __metadata("design:type", String)
], DogInfo.prototype, "breed", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    (0, typegoose_1.Prop)({ required: false }),
    __metadata("design:type", String)
], DogInfo.prototype, "dateOfBirth", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    (0, typegoose_1.Prop)({ required: false }),
    __metadata("design:type", String)
], DogInfo.prototype, "nzkcRegistration", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    (0, typegoose_1.Prop)({ required: false }),
    __metadata("design:type", String)
], DogInfo.prototype, "nzkcOwner", void 0);
exports.DogInfo = DogInfo = __decorate([
    (0, type_graphql_1.ObjectType)()
], DogInfo);
let Form = class Form {
};
exports.Form = Form;
__decorate([
    (0, type_graphql_1.Field)(() => String),
    __metadata("design:type", String)
], Form.prototype, "_id", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    (0, typegoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Form.prototype, "formName", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    (0, typegoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Form.prototype, "formType", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    (0, typegoose_1.Prop)({ required: false }),
    __metadata("design:type", String)
], Form.prototype, "file", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    (0, typegoose_1.Prop)({ required: false }),
    __metadata("design:type", String)
], Form.prototype, "fileName", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Date, { nullable: true }),
    (0, typegoose_1.Prop)({ required: true, default: Date.now }),
    __metadata("design:type", Date)
], Form.prototype, "createdAt", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    (0, typegoose_1.Prop)({ required: false }),
    __metadata("design:type", String)
], Form.prototype, "applicantName", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    (0, typegoose_1.Prop)({ required: false }),
    __metadata("design:type", String)
], Form.prototype, "surname", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    (0, typegoose_1.Prop)({ required: false }),
    __metadata("design:type", String)
], Form.prototype, "firstName", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    (0, typegoose_1.Prop)({ required: false }),
    __metadata("design:type", String)
], Form.prototype, "address", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    (0, typegoose_1.Prop)({ required: false }),
    __metadata("design:type", String)
], Form.prototype, "dateOfBirth", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    (0, typegoose_1.Prop)({ required: false }),
    __metadata("design:type", String)
], Form.prototype, "phone", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    (0, typegoose_1.Prop)({ required: false }),
    __metadata("design:type", String)
], Form.prototype, "email", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    (0, typegoose_1.Prop)({ required: false }),
    __metadata("design:type", String)
], Form.prototype, "guardianDetails", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    (0, typegoose_1.Prop)({ required: false }),
    __metadata("design:type", String)
], Form.prototype, "nzfssRegistrationNumber", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    (0, typegoose_1.Prop)({ required: false }),
    __metadata("design:type", String)
], Form.prototype, "club", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    (0, typegoose_1.Prop)({ required: false }),
    __metadata("design:type", String)
], Form.prototype, "affiliationFrom", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    (0, typegoose_1.Prop)({ required: false }),
    __metadata("design:type", String)
], Form.prototype, "affiliationTo", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => [DogInfo], { nullable: true }),
    (0, typegoose_1.Prop)({ type: () => [DogInfo], required: false }),
    __metadata("design:type", Array)
], Form.prototype, "dogs", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Boolean, { nullable: true }),
    (0, typegoose_1.Prop)({ required: false }),
    __metadata("design:type", Boolean)
], Form.prototype, "showProfileConsent", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    (0, typegoose_1.Prop)({ required: false, default: "pending", enum: ["pending", "approved", "declined"] }),
    __metadata("design:type", String)
], Form.prototype, "status", void 0);
exports.Form = Form = __decorate([
    (0, type_graphql_1.ObjectType)()
], Form);
exports.FormModel = (0, typegoose_1.getModelForClass)(Form);
let DogInput = class DogInput {
};
exports.DogInput = DogInput;
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], DogInput.prototype, "petName", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Boolean, { nullable: true }),
    __metadata("design:type", Boolean)
], DogInput.prototype, "isDeceased", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], DogInput.prototype, "nzfssNumber", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], DogInput.prototype, "pedigreeName", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], DogInput.prototype, "breed", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], DogInput.prototype, "dateOfBirth", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], DogInput.prototype, "nzkcRegistration", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], DogInput.prototype, "nzkcOwner", void 0);
exports.DogInput = DogInput = __decorate([
    (0, type_graphql_1.InputType)("FormDogInput")
], DogInput);
let CreateFormInput = class CreateFormInput {
};
exports.CreateFormInput = CreateFormInput;
__decorate([
    (0, type_graphql_1.Field)(() => String),
    __metadata("design:type", String)
], CreateFormInput.prototype, "formName", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    __metadata("design:type", String)
], CreateFormInput.prototype, "formType", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], CreateFormInput.prototype, "file", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreateFormInput.prototype, "fileName", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], CreateFormInput.prototype, "applicantName", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], CreateFormInput.prototype, "surname", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], CreateFormInput.prototype, "firstName", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], CreateFormInput.prototype, "address", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], CreateFormInput.prototype, "dateOfBirth", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], CreateFormInput.prototype, "phone", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], CreateFormInput.prototype, "email", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], CreateFormInput.prototype, "guardianDetails", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], CreateFormInput.prototype, "nzfssRegistrationNumber", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], CreateFormInput.prototype, "club", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], CreateFormInput.prototype, "affiliationFrom", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], CreateFormInput.prototype, "affiliationTo", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => [DogInput], { nullable: true }),
    __metadata("design:type", Array)
], CreateFormInput.prototype, "dogs", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Boolean, { nullable: true }),
    __metadata("design:type", Boolean)
], CreateFormInput.prototype, "showProfileConsent", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], CreateFormInput.prototype, "status", void 0);
exports.CreateFormInput = CreateFormInput = __decorate([
    (0, type_graphql_1.InputType)()
], CreateFormInput);
let UpdateFormInput = class UpdateFormInput {
};
exports.UpdateFormInput = UpdateFormInput;
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateFormInput.prototype, "formName", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateFormInput.prototype, "formType", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateFormInput.prototype, "file", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateFormInput.prototype, "fileName", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateFormInput.prototype, "status", void 0);
exports.UpdateFormInput = UpdateFormInput = __decorate([
    (0, type_graphql_1.InputType)()
], UpdateFormInput);
let FindFormByIdInput = class FindFormByIdInput {
};
exports.FindFormByIdInput = FindFormByIdInput;
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], FindFormByIdInput.prototype, "formId", void 0);
exports.FindFormByIdInput = FindFormByIdInput = __decorate([
    (0, type_graphql_1.InputType)()
], FindFormByIdInput);
//# sourceMappingURL=form.schema.js.map