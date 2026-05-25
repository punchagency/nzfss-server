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
exports.SubmitPointsResponse = exports.PointsInput = exports.DogPointInput = exports.PointModel = exports.Point = exports.DogPoint = void 0;
const typegoose_1 = require("@typegoose/typegoose");
const type_graphql_1 = require("type-graphql");
const entrants_schema_1 = require("./entrants.schema");
const heat_schema_1 = require("./heat.schema");
let DogPoint = class DogPoint {
};
exports.DogPoint = DogPoint;
__decorate([
    (0, type_graphql_1.Field)(() => String),
    __metadata("design:type", String)
], DogPoint.prototype, "NZFSSRegistration", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Number),
    __metadata("design:type", Number)
], DogPoint.prototype, "points", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Number, { nullable: true, defaultValue: 0 }),
    __metadata("design:type", Number)
], DogPoint.prototype, "cutoffPoints", void 0);
exports.DogPoint = DogPoint = __decorate([
    (0, type_graphql_1.ObjectType)()
], DogPoint);
let Point = class Point {
};
exports.Point = Point;
__decorate([
    (0, type_graphql_1.Field)(() => String),
    __metadata("design:type", String)
], Point.prototype, "_id", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    (0, typegoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Point.prototype, "entrantId", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Number),
    (0, typegoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Point.prototype, "points", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    (0, typegoose_1.Prop)({ required: false }),
    __metadata("design:type", String)
], Point.prototype, "cutoffTime", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => [DogPoint], { nullable: true }),
    (0, typegoose_1.Prop)({
        type: () => [Object],
        default: [],
        validate: {
            validator: function (dogPoints) {
                return dogPoints.every(dp => typeof dp.NZFSSRegistration === 'string' &&
                    typeof dp.points === 'number' &&
                    (dp.cutoffPoints === undefined || typeof dp.cutoffPoints === 'number'));
            },
            message: 'Each dog point must have valid NZFSSRegistration, points, and optional cutoffPoints'
        }
    }),
    __metadata("design:type", Array)
], Point.prototype, "dogPoints", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => [heat_schema_1.HeatData], { nullable: true }),
    (0, typegoose_1.Prop)({ type: () => [Object], default: [] }),
    __metadata("design:type", Array)
], Point.prototype, "heatsData", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Date, { nullable: true }),
    (0, typegoose_1.Prop)({ required: true, default: Date.now }),
    __metadata("design:type", Date)
], Point.prototype, "createdAt", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Date, { nullable: true }),
    (0, typegoose_1.Prop)({ required: true, default: Date.now }),
    __metadata("design:type", Date)
], Point.prototype, "updatedAt", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => entrants_schema_1.Entrants, { nullable: true }),
    __metadata("design:type", entrants_schema_1.Entrants)
], Point.prototype, "entrant", void 0);
exports.Point = Point = __decorate([
    (0, type_graphql_1.ObjectType)()
], Point);
exports.PointModel = (0, typegoose_1.getModelForClass)(Point);
let DogPointInput = class DogPointInput {
};
exports.DogPointInput = DogPointInput;
__decorate([
    (0, type_graphql_1.Field)(() => String),
    __metadata("design:type", String)
], DogPointInput.prototype, "NZFSSRegistration", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Number),
    __metadata("design:type", Number)
], DogPointInput.prototype, "points", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Number, { defaultValue: 0 }),
    __metadata("design:type", Number)
], DogPointInput.prototype, "cutoffPoints", void 0);
exports.DogPointInput = DogPointInput = __decorate([
    (0, type_graphql_1.InputType)()
], DogPointInput);
let PointsInput = class PointsInput {
};
exports.PointsInput = PointsInput;
__decorate([
    (0, type_graphql_1.Field)(() => String),
    __metadata("design:type", String)
], PointsInput.prototype, "entrantId", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Number),
    __metadata("design:type", Number)
], PointsInput.prototype, "points", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], PointsInput.prototype, "cutoffTime", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => [DogPointInput]),
    __metadata("design:type", Array)
], PointsInput.prototype, "dogPoints", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => [heat_schema_1.HeatData], { nullable: true }),
    __metadata("design:type", Array)
], PointsInput.prototype, "heatsData", void 0);
exports.PointsInput = PointsInput = __decorate([
    (0, type_graphql_1.InputType)()
], PointsInput);
let SubmitPointsResponse = class SubmitPointsResponse {
};
exports.SubmitPointsResponse = SubmitPointsResponse;
__decorate([
    (0, type_graphql_1.Field)(() => Boolean),
    __metadata("design:type", Boolean)
], SubmitPointsResponse.prototype, "success", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], SubmitPointsResponse.prototype, "message", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => [Point], { nullable: true }),
    __metadata("design:type", Array)
], SubmitPointsResponse.prototype, "points", void 0);
exports.SubmitPointsResponse = SubmitPointsResponse = __decorate([
    (0, type_graphql_1.ObjectType)()
], SubmitPointsResponse);
//# sourceMappingURL=point.schema.js.map