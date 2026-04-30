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
exports.FindDogsByIdInput = exports.UpdateDogsInput = exports.CreateDogInput = exports.DogsModel = exports.Dogs = void 0;
const typegoose_1 = require("@typegoose/typegoose");
const type_graphql_1 = require("type-graphql");
const user_schema_1 = require("./user.schema");
let Dogs = class Dogs {
};
exports.Dogs = Dogs;
__decorate([
    (0, type_graphql_1.Field)(() => String),
    __metadata("design:type", String)
], Dogs.prototype, "_id", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    (0, typegoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Dogs.prototype, "driverName", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    (0, typegoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Dogs.prototype, "name", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    (0, typegoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Dogs.prototype, "NZFSSRegistration", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    (0, typegoose_1.Prop)({ required: false }),
    __metadata("design:type", String)
], Dogs.prototype, "DateOfBirth", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    (0, typegoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Dogs.prototype, "Breed", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    (0, typegoose_1.Prop)({ required: true, ref: () => user_schema_1.User }),
    __metadata("design:type", Object)
], Dogs.prototype, "userId", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Date, { nullable: true }),
    (0, typegoose_1.Prop)({ required: true, default: Date.now }),
    __metadata("design:type", Date)
], Dogs.prototype, "createdAt", void 0);
exports.Dogs = Dogs = __decorate([
    (0, type_graphql_1.ObjectType)()
], Dogs);
exports.DogsModel = (0, typegoose_1.getModelForClass)(Dogs);
let CreateDogInput = class CreateDogInput {
};
exports.CreateDogInput = CreateDogInput;
__decorate([
    (0, type_graphql_1.Field)(() => String),
    __metadata("design:type", String)
], CreateDogInput.prototype, "driverName", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    __metadata("design:type", String)
], CreateDogInput.prototype, "name", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    __metadata("design:type", String)
], CreateDogInput.prototype, "NZFSSRegistration", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], CreateDogInput.prototype, "DateOfBirth", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    __metadata("design:type", String)
], CreateDogInput.prototype, "Breed", void 0);
exports.CreateDogInput = CreateDogInput = __decorate([
    (0, type_graphql_1.InputType)()
], CreateDogInput);
let UpdateDogsInput = class UpdateDogsInput {
};
exports.UpdateDogsInput = UpdateDogsInput;
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateDogsInput.prototype, "driverName", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateDogsInput.prototype, "name", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateDogsInput.prototype, "NZFSSRegistration", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateDogsInput.prototype, "DateOfBirth", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateDogsInput.prototype, "Breed", void 0);
exports.UpdateDogsInput = UpdateDogsInput = __decorate([
    (0, type_graphql_1.InputType)()
], UpdateDogsInput);
let FindDogsByIdInput = class FindDogsByIdInput {
};
exports.FindDogsByIdInput = FindDogsByIdInput;
__decorate([
    (0, type_graphql_1.Field)(() => String),
    __metadata("design:type", String)
], FindDogsByIdInput.prototype, "_id", void 0);
exports.FindDogsByIdInput = FindDogsByIdInput = __decorate([
    (0, type_graphql_1.InputType)()
], FindDogsByIdInput);
//# sourceMappingURL=dog.schema.js.map