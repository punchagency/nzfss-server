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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RcrPointsResolver = void 0;
const type_graphql_1 = require("type-graphql");
const rcrpoints_schema_1 = require("../schema/rcrpoints.schema");
let RcrPointsResolver = class RcrPointsResolver {
    async getAllRcrPoints() {
        try {
            console.log("Fetching RCR points...");
            const rcrPoints = await rcrpoints_schema_1.RcrPointsModel.find({})
                .lean()
                .maxTimeMS(10000);
            console.log(`Found ${rcrPoints.length} RCR points`);
            return rcrPoints.map(point => ({
                _id: point._id.toString(),
                rcrFlag: point.rcrFlag || null,
                rcrReg: point.rcrReg || null,
                rcrPedigreeName: point.rcrPedigreeName || null,
                rcrBreed: point.rcrBreed || null,
                rcrPoints: point.rcrPoints || null,
                rcrEvents: point.rcrEvents || null,
                rcrAwards: point.rcrAwards || null,
                rcrCutoff: point.rcrCutoff || null,
                createdAt: point.createdAt || new Date(),
                updatedAt: point.updatedAt || new Date()
            }));
        }
        catch (error) {
            console.error("Error fetching RCR points:", error);
            return [];
        }
    }
    async getRcrPointsByFlag(flag) {
        try {
            const rcrPoints = await rcrpoints_schema_1.RcrPointsModel.find({ rcrFlag: flag }).lean();
            return rcrPoints.map(point => ({
                _id: point._id.toString(),
                rcrFlag: point.rcrFlag || null,
                rcrReg: point.rcrReg || null,
                rcrPedigreeName: point.rcrPedigreeName || null,
                rcrBreed: point.rcrBreed || null,
                rcrPoints: point.rcrPoints || null,
                rcrEvents: point.rcrEvents || null,
                rcrAwards: point.rcrAwards || null,
                rcrCutoff: point.rcrCutoff || null,
                createdAt: point.createdAt || new Date(),
                updatedAt: point.updatedAt || new Date()
            }));
        }
        catch (error) {
            console.error("Error fetching RCR points by flag:", error);
            throw new Error("Failed to fetch RCR points by flag");
        }
    }
};
exports.RcrPointsResolver = RcrPointsResolver;
__decorate([
    (0, type_graphql_1.Query)(() => [rcrpoints_schema_1.RcrPoints]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RcrPointsResolver.prototype, "getAllRcrPoints", null);
__decorate([
    (0, type_graphql_1.Query)(() => [rcrpoints_schema_1.RcrPoints]),
    __param(0, (0, type_graphql_1.Arg)("flag")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RcrPointsResolver.prototype, "getRcrPointsByFlag", null);
exports.RcrPointsResolver = RcrPointsResolver = __decorate([
    (0, type_graphql_1.Resolver)()
], RcrPointsResolver);
//# sourceMappingURL=rcrpoints.resolver.js.map