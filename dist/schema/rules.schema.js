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
exports.FindRulesByIdInput = exports.UpdateRulesInput = exports.CreateRulesInput = exports.RulesModel = exports.Rules = void 0;
const typegoose_1 = require("@typegoose/typegoose");
const type_graphql_1 = require("type-graphql");
let Rules = class Rules {
};
exports.Rules = Rules;
__decorate([
    (0, type_graphql_1.Field)(() => String),
    __metadata("design:type", String)
], Rules.prototype, "_id", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    (0, typegoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Rules.prototype, "constitutionRules", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    (0, typegoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Rules.prototype, "amendedDate", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    (0, typegoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Rules.prototype, "file", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    (0, typegoose_1.Prop)({ required: false }),
    __metadata("design:type", String)
], Rules.prototype, "fileName", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Date, { nullable: true }),
    (0, typegoose_1.Prop)({ required: true, default: Date.now }),
    __metadata("design:type", Date)
], Rules.prototype, "createdAt", void 0);
exports.Rules = Rules = __decorate([
    (0, type_graphql_1.ObjectType)()
], Rules);
exports.RulesModel = (0, typegoose_1.getModelForClass)(Rules);
let CreateRulesInput = class CreateRulesInput {
};
exports.CreateRulesInput = CreateRulesInput;
__decorate([
    (0, type_graphql_1.Field)(() => String),
    __metadata("design:type", String)
], CreateRulesInput.prototype, "constitutionRules", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    __metadata("design:type", String)
], CreateRulesInput.prototype, "amendedDate", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    __metadata("design:type", String)
], CreateRulesInput.prototype, "file", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreateRulesInput.prototype, "fileName", void 0);
exports.CreateRulesInput = CreateRulesInput = __decorate([
    (0, type_graphql_1.InputType)()
], CreateRulesInput);
let UpdateRulesInput = class UpdateRulesInput {
};
exports.UpdateRulesInput = UpdateRulesInput;
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateRulesInput.prototype, "constitutionRules", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateRulesInput.prototype, "amendedDate", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateRulesInput.prototype, "file", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateRulesInput.prototype, "fileName", void 0);
exports.UpdateRulesInput = UpdateRulesInput = __decorate([
    (0, type_graphql_1.InputType)()
], UpdateRulesInput);
let FindRulesByIdInput = class FindRulesByIdInput {
};
exports.FindRulesByIdInput = FindRulesByIdInput;
__decorate([
    (0, type_graphql_1.Field)(() => String),
    __metadata("design:type", String)
], FindRulesByIdInput.prototype, "_id", void 0);
exports.FindRulesByIdInput = FindRulesByIdInput = __decorate([
    (0, type_graphql_1.InputType)()
], FindRulesByIdInput);
//# sourceMappingURL=rules.schema.js.map