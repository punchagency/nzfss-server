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
exports.MusherModel = void 0;
const typegoose_1 = require("@typegoose/typegoose");
let Dog = class Dog {
};
__decorate([
    (0, typegoose_1.prop)({ required: false }),
    __metadata("design:type", String)
], Dog.prototype, "name", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: String, required: false }),
    __metadata("design:type", String)
], Dog.prototype, "pedigreeName", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: String, required: false }),
    __metadata("design:type", String)
], Dog.prototype, "nzkcNo", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: String, required: false }),
    __metadata("design:type", String)
], Dog.prototype, "nzfssNo", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: String, required: false }),
    __metadata("design:type", String)
], Dog.prototype, "dateOfBirth", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: String, required: false }),
    __metadata("design:type", String)
], Dog.prototype, "breed", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: Boolean, default: false }),
    __metadata("design:type", Boolean)
], Dog.prototype, "deceased", void 0);
Dog = __decorate([
    (0, typegoose_1.modelOptions)({ schemaOptions: { timestamps: true } })
], Dog);
let Musher = class Musher {
};
__decorate([
    (0, typegoose_1.prop)({ required: true }),
    __metadata("design:type", String)
], Musher.prototype, "name", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: String, required: false }),
    __metadata("design:type", String)
], Musher.prototype, "registrationNo", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: String, required: false }),
    __metadata("design:type", String)
], Musher.prototype, "kennelRegistrationNo", void 0);
__decorate([
    (0, typegoose_1.prop)({ ref: "Club", required: true }),
    __metadata("design:type", String)
], Musher.prototype, "club", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => [Dog], _id: false }),
    __metadata("design:type", Array)
], Musher.prototype, "dogs", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: Boolean, default: false }),
    __metadata("design:type", Boolean)
], Musher.prototype, "showProfileConsent", void 0);
Musher = __decorate([
    (0, typegoose_1.modelOptions)({ schemaOptions: { timestamps: true } })
], Musher);
exports.MusherModel = (0, typegoose_1.getModelForClass)(Musher);
//# sourceMappingURL=musher.model.js.map