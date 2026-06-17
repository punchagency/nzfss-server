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
exports.DogRacePointsResolver = void 0;
const type_graphql_1 = require("type-graphql");
const apollo_server_1 = require("apollo-server");
const dog_race_points_schema_1 = require("../schema/dog-race-points.schema");
const dog_race_points_service_1 = require("../service/dog-race-points.service");
let DogRacePointsResolver = class DogRacePointsResolver {
    async getDogRacePointSummaries() {
        try {
            return await (0, dog_race_points_service_1.computeDogRacePointSummaries)();
        }
        catch (error) {
            console.error("Error computing dog race point summaries:", error);
            throw new apollo_server_1.ApolloError(`Failed to compute dog race points: ${error.message}`);
        }
    }
};
exports.DogRacePointsResolver = DogRacePointsResolver;
__decorate([
    (0, type_graphql_1.Query)(() => [dog_race_points_schema_1.DogRacePointSummary]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DogRacePointsResolver.prototype, "getDogRacePointSummaries", null);
exports.DogRacePointsResolver = DogRacePointsResolver = __decorate([
    (0, type_graphql_1.Resolver)()
], DogRacePointsResolver);
//# sourceMappingURL=dog-race-points.resolver.js.map