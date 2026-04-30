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
exports.WprPointsResolver = void 0;
const type_graphql_1 = require("type-graphql");
const wprpoints_schema_1 = require("../schema/wprpoints.schema");
let WprPointsResolver = class WprPointsResolver {
    async getAllWprPoints() {
        try {
            const wprPoints = await wprpoints_schema_1.WprPointsModel.find({}).lean();
            return wprPoints.map(point => ({
                _id: point._id.toString(),
                wprFlag: point.wprFlag || null,
                wprReg: point.wprReg || null,
                wprPedigreeName: point.wprPedigreeName || null,
                wprBreed: point.wprBreed || null,
                wprMaxWeight: point.wprMaxWeight || null,
                wprMaxBWR: point.wprMaxBWR || null,
                wprPoints: point.wprPoints || null,
                wprAwards: point.wprAwards || null,
                createdAt: point.createdAt || new Date(),
                updatedAt: point.updatedAt || new Date()
            }));
        }
        catch (error) {
            console.error("Error fetching WPR points:", error);
            throw new Error("Failed to fetch WPR points");
        }
    }
    async getWprPointsByFlag(wprFlag) {
        try {
            const wprPoint = await wprpoints_schema_1.WprPointsModel.findOne({ wprFlag }).lean();
            if (!wprPoint)
                return null;
            return {
                _id: wprPoint._id.toString(),
                wprFlag: wprPoint.wprFlag || null,
                wprReg: wprPoint.wprReg || null,
                wprPedigreeName: wprPoint.wprPedigreeName || null,
                wprBreed: wprPoint.wprBreed || null,
                wprMaxWeight: wprPoint.wprMaxWeight || null,
                wprMaxBWR: wprPoint.wprMaxBWR || null,
                wprPoints: wprPoint.wprPoints || null,
                wprAwards: wprPoint.wprAwards || null,
                createdAt: wprPoint.createdAt || new Date(),
                updatedAt: wprPoint.updatedAt || new Date()
            };
        }
        catch (error) {
            console.error("Error fetching WPR point by flag:", error);
            throw new Error("Failed to fetch WPR point");
        }
    }
};
exports.WprPointsResolver = WprPointsResolver;
__decorate([
    (0, type_graphql_1.Query)(() => [wprpoints_schema_1.WprPoints]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WprPointsResolver.prototype, "getAllWprPoints", null);
__decorate([
    (0, type_graphql_1.Query)(() => wprpoints_schema_1.WprPoints, { nullable: true }),
    __param(0, (0, type_graphql_1.Arg)("wprFlag")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WprPointsResolver.prototype, "getWprPointsByFlag", null);
exports.WprPointsResolver = WprPointsResolver = __decorate([
    (0, type_graphql_1.Resolver)()
], WprPointsResolver);
//# sourceMappingURL=wprpoints.resolver.js.map