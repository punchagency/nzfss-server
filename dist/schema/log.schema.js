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
exports.FindLogsByIdInput = exports.CreateLogInput = exports.LogModel = exports.Log = void 0;
const typegoose_1 = require("@typegoose/typegoose");
const type_graphql_1 = require("type-graphql");
const user_schema_1 = require("./user.schema");
let Log = class Log {
};
exports.Log = Log;
__decorate([
    (0, type_graphql_1.Field)(() => String),
    __metadata("design:type", String)
], Log.prototype, "_id", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    (0, typegoose_1.Prop)({ required: true, ref: () => user_schema_1.User }),
    __metadata("design:type", Object)
], Log.prototype, "userId", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    (0, typegoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Log.prototype, "action", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    (0, typegoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Log.prototype, "entity", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    (0, typegoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Log.prototype, "entityId", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    (0, typegoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Log.prototype, "oldData", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    (0, typegoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Log.prototype, "newData", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Date, { nullable: true }),
    (0, typegoose_1.Prop)({ required: true, default: Date.now }),
    __metadata("design:type", Date)
], Log.prototype, "createdAt", void 0);
exports.Log = Log = __decorate([
    (0, type_graphql_1.ObjectType)()
], Log);
exports.LogModel = (0, typegoose_1.getModelForClass)(Log);
let CreateLogInput = class CreateLogInput {
};
exports.CreateLogInput = CreateLogInput;
__decorate([
    (0, type_graphql_1.Field)(() => String),
    __metadata("design:type", String)
], CreateLogInput.prototype, "userId", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    __metadata("design:type", String)
], CreateLogInput.prototype, "action", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    __metadata("design:type", String)
], CreateLogInput.prototype, "entity", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    __metadata("design:type", String)
], CreateLogInput.prototype, "entityId", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    __metadata("design:type", String)
], CreateLogInput.prototype, "oldData", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    __metadata("design:type", String)
], CreateLogInput.prototype, "newData", void 0);
exports.CreateLogInput = CreateLogInput = __decorate([
    (0, type_graphql_1.InputType)()
], CreateLogInput);
let FindLogsByIdInput = class FindLogsByIdInput {
};
exports.FindLogsByIdInput = FindLogsByIdInput;
__decorate([
    (0, type_graphql_1.Field)(() => String),
    __metadata("design:type", String)
], FindLogsByIdInput.prototype, "_id", void 0);
exports.FindLogsByIdInput = FindLogsByIdInput = __decorate([
    (0, type_graphql_1.InputType)()
], FindLogsByIdInput);
//# sourceMappingURL=log.schema.js.map