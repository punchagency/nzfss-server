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
exports.RecogniseTitleChangesResponse = exports.RecogniseTitleChangesInput = exports.UnrecognisedTitleChange = void 0;
const type_graphql_1 = require("type-graphql");
let UnrecognisedTitleChange = class UnrecognisedTitleChange {
};
exports.UnrecognisedTitleChange = UnrecognisedTitleChange;
__decorate([
    (0, type_graphql_1.Field)(() => String),
    __metadata("design:type", String)
], UnrecognisedTitleChange.prototype, "dogId", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    __metadata("design:type", String)
], UnrecognisedTitleChange.prototype, "musherId", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], UnrecognisedTitleChange.prototype, "dogName", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], UnrecognisedTitleChange.prototype, "pedigreeName", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], UnrecognisedTitleChange.prototype, "nzfssNo", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], UnrecognisedTitleChange.prototype, "ownerName", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], UnrecognisedTitleChange.prototype, "breed", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    __metadata("design:type", String)
], UnrecognisedTitleChange.prototype, "previousTitle", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    __metadata("design:type", String)
], UnrecognisedTitleChange.prototype, "newTitle", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], UnrecognisedTitleChange.prototype, "previousTitleCode", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    __metadata("design:type", String)
], UnrecognisedTitleChange.prototype, "newTitleCode", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Number),
    __metadata("design:type", Number)
], UnrecognisedTitleChange.prototype, "points", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Number),
    __metadata("design:type", Number)
], UnrecognisedTitleChange.prototype, "events", void 0);
exports.UnrecognisedTitleChange = UnrecognisedTitleChange = __decorate([
    (0, type_graphql_1.ObjectType)()
], UnrecognisedTitleChange);
let RecogniseTitleChangesInput = class RecogniseTitleChangesInput {
};
exports.RecogniseTitleChangesInput = RecogniseTitleChangesInput;
__decorate([
    (0, type_graphql_1.Field)(() => [String]),
    __metadata("design:type", Array)
], RecogniseTitleChangesInput.prototype, "dogIds", void 0);
exports.RecogniseTitleChangesInput = RecogniseTitleChangesInput = __decorate([
    (0, type_graphql_1.InputType)()
], RecogniseTitleChangesInput);
let RecogniseTitleChangesResponse = class RecogniseTitleChangesResponse {
};
exports.RecogniseTitleChangesResponse = RecogniseTitleChangesResponse;
__decorate([
    (0, type_graphql_1.Field)(() => Boolean),
    __metadata("design:type", Boolean)
], RecogniseTitleChangesResponse.prototype, "success", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Number),
    __metadata("design:type", Number)
], RecogniseTitleChangesResponse.prototype, "recognisedCount", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], RecogniseTitleChangesResponse.prototype, "message", void 0);
exports.RecogniseTitleChangesResponse = RecogniseTitleChangesResponse = __decorate([
    (0, type_graphql_1.ObjectType)()
], RecogniseTitleChangesResponse);
//# sourceMappingURL=dog-title.schema.js.map