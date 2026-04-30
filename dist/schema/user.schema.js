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
exports.UpdateUserInput = exports.FindUserByIdInput = exports.LoginInput = exports.CreateUserInput = exports.UserModel = exports.LoginResponse = exports.User = exports.UserRole = void 0;
const typegoose_1 = require("@typegoose/typegoose");
const class_validator_1 = require("class-validator");
const type_graphql_1 = require("type-graphql");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const club_schema_1 = require("./club.schema");
var UserRole;
(function (UserRole) {
    UserRole["ADMIN"] = "ADMIN";
    UserRole["CLUB"] = "CLUB";
})(UserRole || (exports.UserRole = UserRole = {}));
(0, type_graphql_1.registerEnumType)(UserRole, {
    name: "UserRole",
});
function findByEmail(email) {
    return this.findOne({ email });
}
let User = class User {
};
exports.User = User;
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.ID),
    __metadata("design:type", String)
], User.prototype, "_id", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    (0, typegoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], User.prototype, "name", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    (0, typegoose_1.Prop)({ required: true, unique: true }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    (0, typegoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], User.prototype, "password", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    (0, typegoose_1.Prop)({ required: false }),
    __metadata("design:type", String)
], User.prototype, "gender", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    (0, typegoose_1.Prop)({ required: false }),
    __metadata("design:type", String)
], User.prototype, "address", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    (0, typegoose_1.Prop)({ required: false }),
    __metadata("design:type", String)
], User.prototype, "city", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    (0, typegoose_1.Prop)({ required: false }),
    __metadata("design:type", String)
], User.prototype, "postCode", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    (0, typegoose_1.Prop)({ required: false }),
    __metadata("design:type", String)
], User.prototype, "dob", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => UserRole),
    (0, typegoose_1.Prop)({ required: true, default: UserRole.ADMIN }),
    __metadata("design:type", String)
], User.prototype, "role", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => club_schema_1.Club, { nullable: true }),
    (0, typegoose_1.Prop)({ ref: 'Club' }),
    __metadata("design:type", club_schema_1.Club)
], User.prototype, "club", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    (0, typegoose_1.Prop)({ required: true, default: Date.now }),
    __metadata("design:type", Date)
], User.prototype, "created_at", void 0);
exports.User = User = __decorate([
    (0, typegoose_1.pre)('save', async function () {
        if (!this.isModified('password')) {
            return;
        }
        const salt = await bcryptjs_1.default.genSalt(10);
        const hash = await bcryptjs_1.default.hashSync(this.password, salt);
        this.password = hash;
    }),
    (0, typegoose_1.index)({ email: 1 }),
    (0, typegoose_1.queryMethod)(findByEmail),
    (0, type_graphql_1.ObjectType)()
], User);
let LoginResponse = class LoginResponse {
};
exports.LoginResponse = LoginResponse;
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.ID),
    __metadata("design:type", String)
], LoginResponse.prototype, "_id", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    __metadata("design:type", String)
], LoginResponse.prototype, "name", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    __metadata("design:type", String)
], LoginResponse.prototype, "email", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => UserRole),
    __metadata("design:type", String)
], LoginResponse.prototype, "role", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], LoginResponse.prototype, "token", void 0);
exports.LoginResponse = LoginResponse = __decorate([
    (0, type_graphql_1.ObjectType)()
], LoginResponse);
exports.UserModel = (0, typegoose_1.getModelForClass)(User);
let CreateUserInput = class CreateUserInput {
};
exports.CreateUserInput = CreateUserInput;
__decorate([
    (0, type_graphql_1.Field)(() => String),
    __metadata("design:type", String)
], CreateUserInput.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsEmail)(),
    (0, type_graphql_1.Field)(() => String),
    __metadata("design:type", String)
], CreateUserInput.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.MinLength)(6, {
        message: 'Password must be at least 6 characters long',
    }),
    (0, class_validator_1.MaxLength)(50, {
        message: 'Password must not be longer than 50 characters',
    }),
    (0, class_validator_1.Matches)(/^(?=.*[!@#$%^&*(),.?":{}|<>])/, {
        message: 'Password must contain at least one special character',
    }),
    (0, type_graphql_1.Field)(() => String),
    __metadata("design:type", String)
], CreateUserInput.prototype, "password", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => UserRole, { nullable: true }),
    __metadata("design:type", String)
], CreateUserInput.prototype, "role", void 0);
exports.CreateUserInput = CreateUserInput = __decorate([
    (0, type_graphql_1.InputType)()
], CreateUserInput);
let LoginInput = class LoginInput {
};
exports.LoginInput = LoginInput;
__decorate([
    (0, type_graphql_1.Field)(() => String),
    __metadata("design:type", String)
], LoginInput.prototype, "email", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    __metadata("design:type", String)
], LoginInput.prototype, "password", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Boolean)
], LoginInput.prototype, "rememberMe", void 0);
exports.LoginInput = LoginInput = __decorate([
    (0, type_graphql_1.InputType)()
], LoginInput);
let FindUserByIdInput = class FindUserByIdInput {
};
exports.FindUserByIdInput = FindUserByIdInput;
__decorate([
    (0, type_graphql_1.Field)(() => String),
    __metadata("design:type", String)
], FindUserByIdInput.prototype, "_id", void 0);
exports.FindUserByIdInput = FindUserByIdInput = __decorate([
    (0, type_graphql_1.InputType)()
], FindUserByIdInput);
let UpdateUserInput = class UpdateUserInput {
};
exports.UpdateUserInput = UpdateUserInput;
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateUserInput.prototype, "name", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateUserInput.prototype, "email", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateUserInput.prototype, "password", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateUserInput.prototype, "newPassword", void 0);
exports.UpdateUserInput = UpdateUserInput = __decorate([
    (0, type_graphql_1.InputType)()
], UpdateUserInput);
//# sourceMappingURL=user.schema.js.map