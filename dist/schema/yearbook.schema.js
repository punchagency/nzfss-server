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
exports.FindYearbookByIdInput = exports.UpdateYearbookInput = exports.CreateYearbookInput = exports.YearbookModel = exports.Yearbook = void 0;
const typegoose_1 = require("@typegoose/typegoose");
const type_graphql_1 = require("type-graphql");
let Yearbook = class Yearbook {
};
exports.Yearbook = Yearbook;
__decorate([
    (0, type_graphql_1.Field)(() => String),
    __metadata("design:type", String)
], Yearbook.prototype, "_id", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    (0, typegoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Yearbook.prototype, "yearbook", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    (0, typegoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Yearbook.prototype, "yearbookName", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    (0, typegoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Yearbook.prototype, "yearPublish", void 0);
exports.Yearbook = Yearbook = __decorate([
    (0, type_graphql_1.ObjectType)()
], Yearbook);
exports.YearbookModel = (0, typegoose_1.getModelForClass)(Yearbook);
let CreateYearbookInput = class CreateYearbookInput {
};
exports.CreateYearbookInput = CreateYearbookInput;
__decorate([
    (0, type_graphql_1.Field)(() => String),
    __metadata("design:type", String)
], CreateYearbookInput.prototype, "yearbook", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    __metadata("design:type", String)
], CreateYearbookInput.prototype, "yearbookName", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    __metadata("design:type", String)
], CreateYearbookInput.prototype, "yearPublish", void 0);
exports.CreateYearbookInput = CreateYearbookInput = __decorate([
    (0, type_graphql_1.InputType)()
], CreateYearbookInput);
let UpdateYearbookInput = class UpdateYearbookInput {
};
exports.UpdateYearbookInput = UpdateYearbookInput;
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateYearbookInput.prototype, "yearbook", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateYearbookInput.prototype, "yearbookName", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateYearbookInput.prototype, "yearPublish", void 0);
exports.UpdateYearbookInput = UpdateYearbookInput = __decorate([
    (0, type_graphql_1.InputType)()
], UpdateYearbookInput);
let FindYearbookByIdInput = class FindYearbookByIdInput {
};
exports.FindYearbookByIdInput = FindYearbookByIdInput;
__decorate([
    (0, type_graphql_1.Field)(() => String),
    __metadata("design:type", String)
], FindYearbookByIdInput.prototype, "_id", void 0);
exports.FindYearbookByIdInput = FindYearbookByIdInput = __decorate([
    (0, type_graphql_1.InputType)()
], FindYearbookByIdInput);
//# sourceMappingURL=yearbook.schema.js.map