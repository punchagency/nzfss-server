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
exports.FindContactByIdInput = exports.UpdateContactInput = exports.CreateContactInput = exports.Contact = void 0;
const type_graphql_1 = require("type-graphql");
const typegoose_1 = require("@typegoose/typegoose");
const class_validator_1 = require("class-validator");
const user_schema_1 = require("./user.schema");
let Contact = class Contact {
};
exports.Contact = Contact;
__decorate([
    (0, type_graphql_1.Field)(() => String),
    __metadata("design:type", String)
], Contact.prototype, "_id", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    (0, typegoose_1.prop)({ required: true }),
    __metadata("design:type", String)
], Contact.prototype, "name", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    (0, typegoose_1.prop)({ required: true }),
    __metadata("design:type", String)
], Contact.prototype, "designation", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    (0, typegoose_1.prop)({ required: true }),
    __metadata("design:type", String)
], Contact.prototype, "email", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    (0, typegoose_1.prop)(),
    __metadata("design:type", String)
], Contact.prototype, "image", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Date),
    (0, typegoose_1.prop)({ default: Date.now }),
    __metadata("design:type", Date)
], Contact.prototype, "created_at", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    (0, typegoose_1.prop)({ required: true, ref: () => user_schema_1.User }),
    __metadata("design:type", Object)
], Contact.prototype, "club", void 0);
exports.Contact = Contact = __decorate([
    (0, type_graphql_1.ObjectType)()
], Contact);
let CreateContactInput = class CreateContactInput {
};
exports.CreateContactInput = CreateContactInput;
__decorate([
    (0, type_graphql_1.Field)(() => String),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    __metadata("design:type", String)
], CreateContactInput.prototype, "name", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateContactInput.prototype, "designation", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], CreateContactInput.prototype, "email", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], CreateContactInput.prototype, "image", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateContactInput.prototype, "clubId", void 0);
exports.CreateContactInput = CreateContactInput = __decorate([
    (0, type_graphql_1.InputType)()
], CreateContactInput);
let UpdateContactInput = class UpdateContactInput {
};
exports.UpdateContactInput = UpdateContactInput;
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    __metadata("design:type", String)
], UpdateContactInput.prototype, "name", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateContactInput.prototype, "designation", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], UpdateContactInput.prototype, "email", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], UpdateContactInput.prototype, "image", void 0);
exports.UpdateContactInput = UpdateContactInput = __decorate([
    (0, type_graphql_1.InputType)()
], UpdateContactInput);
let FindContactByIdInput = class FindContactByIdInput {
};
exports.FindContactByIdInput = FindContactByIdInput;
__decorate([
    (0, type_graphql_1.Field)(() => String),
    __metadata("design:type", String)
], FindContactByIdInput.prototype, "contactId", void 0);
exports.FindContactByIdInput = FindContactByIdInput = __decorate([
    (0, type_graphql_1.InputType)()
], FindContactByIdInput);
//# sourceMappingURL=contact.schema.js.map