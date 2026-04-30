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
const type_graphql_1 = require("type-graphql");
const apollo_server_1 = require("apollo-server");
const entrants_schema_1 = require("../schema/entrants.schema");
const entrant_service_1 = require("../service/entrant.service");
const log_service_1 = require("../service/log.service");
let EntrantResolver = class EntrantResolver {
    constructor(entrantService, logService) {
        this.entrantService = entrantService;
        this.logService = logService;
        this.entrantService = new entrant_service_1.EntrantService(this.logService);
    }
    createEntrant(context, input) {
        const userId = context.user?._id;
        return this.entrantService.createEntrant(input, userId);
    }
    async getAllEntrants(context) {
        const user = context.user;
        return await this.entrantService.getAllEntrants(user);
    }
    async findSingleEntrantById(input, context) {
        const user = context.user;
        if (!user)
            (new apollo_server_1.ApolloError("User must be authenticated"));
        const Entrant = await this.entrantService.findEntrantById(input);
        return Entrant;
    }
    async getEntrantsByEventId(eventId, context) {
        const user = context.user;
        if (!user)
            (new apollo_server_1.ApolloError("User must be authenticated"));
        return await this.entrantService.findEntrantsByEventId(eventId);
    }
    async updateEntrantDetails(context, input, entrantId) {
        const user = context.user;
        if (!user) {
            throw new apollo_server_1.ApolloError("Unauthorized: User is not authenticated");
        }
        return await this.entrantService.updateEntrant(input, entrantId, user._id);
    }
    async deleteEntrant(context, entrantId) {
        const user = context.user;
        if (!user) {
            throw new apollo_server_1.ApolloError("Unauthorized: User is not authenticated");
        }
        return await this.entrantService.deleteEntrant(entrantId);
    }
};
__decorate([
    (0, type_graphql_1.Authorized)(),
    (0, type_graphql_1.Mutation)(() => entrants_schema_1.Entrants),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("input")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, entrants_schema_1.CreateEntrantInput]),
    __metadata("design:returntype", void 0)
], EntrantResolver.prototype, "createEntrant", null);
__decorate([
    (0, type_graphql_1.Query)(() => [entrants_schema_1.Entrants], { nullable: true }),
    __param(0, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EntrantResolver.prototype, "getAllEntrants", null);
__decorate([
    (0, type_graphql_1.Authorized)(),
    (0, type_graphql_1.Query)(() => entrants_schema_1.Entrants, { nullable: true }),
    __param(0, (0, type_graphql_1.Arg)("input")),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [entrants_schema_1.FindEntrantByIdInput, Object]),
    __metadata("design:returntype", Promise)
], EntrantResolver.prototype, "findSingleEntrantById", null);
__decorate([
    (0, type_graphql_1.Authorized)(),
    (0, type_graphql_1.Query)(() => [entrants_schema_1.Entrants], { nullable: true }),
    __param(0, (0, type_graphql_1.Arg)("eventId")),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], EntrantResolver.prototype, "getEntrantsByEventId", null);
__decorate([
    (0, type_graphql_1.Authorized)(),
    (0, type_graphql_1.Mutation)(() => entrants_schema_1.Entrants),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("input")),
    __param(2, (0, type_graphql_1.Arg)("entrantId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, entrants_schema_1.UpdateEntrantInput, String]),
    __metadata("design:returntype", Promise)
], EntrantResolver.prototype, "updateEntrantDetails", null);
__decorate([
    (0, type_graphql_1.Authorized)(),
    (0, type_graphql_1.Mutation)(() => entrants_schema_1.Entrants),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("entrantId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], EntrantResolver.prototype, "deleteEntrant", null);
EntrantResolver = __decorate([
    (0, type_graphql_1.Resolver)(),
    __metadata("design:paramtypes", [entrant_service_1.EntrantService, log_service_1.LogService])
], EntrantResolver);
exports.default = EntrantResolver;
//# sourceMappingURL=entrant.resolver.js.map