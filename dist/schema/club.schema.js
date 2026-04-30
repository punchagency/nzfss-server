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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FindClubByIdInput = exports.UpdateClubInput = exports.CreateClubInput = exports.ClubModel = exports.Club = void 0;
const typegoose_1 = require("@typegoose/typegoose");
const class_validator_1 = require("class-validator");
const type_graphql_1 = require("type-graphql");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
let Club = class Club {
};
exports.Club = Club;
__decorate([
    (0, type_graphql_1.Field)(() => String),
    __metadata("design:type", String)
], Club.prototype, "_id", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    (0, typegoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Club.prototype, "clubName", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    (0, typegoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Club.prototype, "email", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    (0, typegoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Club.prototype, "password", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Date, { nullable: true }),
    (0, typegoose_1.Prop)({ required: true, default: Date.now }),
    __metadata("design:type", Date)
], Club.prototype, "createdAt", void 0);
exports.Club = Club = __decorate([
    (0, typegoose_1.pre)('save', async function () {
        if (!this.isModified('password')) {
            return;
        }
        const salt = await bcryptjs_1.default.genSalt(10);
        this.password = await bcryptjs_1.default.hash(this.password, salt);
    }),
    (0, type_graphql_1.ObjectType)()
], Club);
exports.ClubModel = (0, typegoose_1.getModelForClass)(Club);
let CreateClubInput = class CreateClubInput {
};
exports.CreateClubInput = CreateClubInput;
__decorate([
    (0, type_graphql_1.Field)(() => String),
    __metadata("design:type", String)
], CreateClubInput.prototype, "clubName", void 0);
__decorate([
    (0, class_validator_1.IsEmail)(),
    (0, type_graphql_1.Field)(() => String),
    __metadata("design:type", String)
], CreateClubInput.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.MinLength)(6, {
        message: 'Password must be at least 6 characters long',
    }),
    (0, class_validator_1.MaxLength)(50, {
        message: 'Password must not be longer than 50 characters',
    }),
    (0, type_graphql_1.Field)(() => String),
    __metadata("design:type", String)
], CreateClubInput.prototype, "password", void 0);
exports.CreateClubInput = CreateClubInput = __decorate([
    (0, type_graphql_1.InputType)()
], CreateClubInput);
let UpdateClubInput = class UpdateClubInput {
};
exports.UpdateClubInput = UpdateClubInput;
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateClubInput.prototype, "clubName", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateClubInput.prototype, "email", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateClubInput.prototype, "password", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateClubInput.prototype, "confirmPassword", void 0);
exports.UpdateClubInput = UpdateClubInput = __decorate([
    (0, type_graphql_1.InputType)()
], UpdateClubInput);
let FindClubByIdInput = class FindClubByIdInput {
};
exports.FindClubByIdInput = FindClubByIdInput;
__decorate([
    (0, type_graphql_1.Field)(() => String),
    __metadata("design:type", String)
], FindClubByIdInput.prototype, "_id", void 0);
exports.FindClubByIdInput = FindClubByIdInput = __decorate([
    (0, type_graphql_1.InputType)()
], FindClubByIdInput);
//# sourceMappingURL=club.schema.js.map