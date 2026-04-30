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
const club_management_schema_1 = require("../schema/club-management.schema");
const club_management_service_1 = require("../service/club-management.service");
const apollo_server_1 = require("apollo-server");
let ClubManagementResolver = class ClubManagementResolver {
    constructor(clubManagementService) {
        this.clubManagementService = clubManagementService;
        this.clubManagementService = new club_management_service_1.ClubManagementService();
    }
    createClubManagement(context, input) {
        return this.clubManagementService.createClubManagement(input, context);
    }
    async getAllClubManagements(context) {
        const user = context.user;
        return await this.clubManagementService.getAllClubManagements(user);
    }
    async findClubManagementById(input, context) {
        const user = context.user;
        return await this.clubManagementService.findClubManagementById(input.clubId, user);
    }
    async updateClubManagement(context, clubId, input) {
        const user = context.user;
        return await this.clubManagementService.updateClubManagement(input, clubId, user);
    }
    async deleteClubManagement(context, clubId) {
        const user = context.user;
        return await this.clubManagementService.deleteClubManagement(clubId, user);
    }
    async getClubManagement(userId, context) {
        const user = context.user;
        if (user._id !== userId && user.role !== "ADMIN") {
            throw new apollo_server_1.ApolloError("Unauthorized access");
        }
        return await this.clubManagementService.getAllClubManagements(user);
    }
    async getCurrentUserClubDetails(context) {
        const user = context.user;
        if (!user) {
            throw new apollo_server_1.ApolloError("User not authenticated");
        }
        const clubs = await this.clubManagementService.getAllClubDetails(user);
        return clubs.length > 0 ? clubs[0] : null;
    }
};
__decorate([
    (0, type_graphql_1.Authorized)(),
    (0, type_graphql_1.Mutation)(() => club_management_schema_1.ClubManagement),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("input")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, club_management_schema_1.CreateClubManagementInput]),
    __metadata("design:returntype", void 0)
], ClubManagementResolver.prototype, "createClubManagement", null);
__decorate([
    (0, type_graphql_1.Query)(() => [club_management_schema_1.ClubManagement], { nullable: true }),
    __param(0, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ClubManagementResolver.prototype, "getAllClubManagements", null);
__decorate([
    (0, type_graphql_1.Authorized)(),
    (0, type_graphql_1.Query)(() => club_management_schema_1.ClubManagement, { nullable: true }),
    __param(0, (0, type_graphql_1.Arg)("input")),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [club_management_schema_1.FindClubManagementByIdInput, Object]),
    __metadata("design:returntype", Promise)
], ClubManagementResolver.prototype, "findClubManagementById", null);
__decorate([
    (0, type_graphql_1.Authorized)(),
    (0, type_graphql_1.Mutation)(() => club_management_schema_1.ClubManagement),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("clubId")),
    __param(2, (0, type_graphql_1.Arg)("input")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, club_management_schema_1.UpdateClubManagementInput]),
    __metadata("design:returntype", Promise)
], ClubManagementResolver.prototype, "updateClubManagement", null);
__decorate([
    (0, type_graphql_1.Authorized)(),
    (0, type_graphql_1.Mutation)(() => club_management_schema_1.ClubManagement),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("clubId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ClubManagementResolver.prototype, "deleteClubManagement", null);
__decorate([
    (0, type_graphql_1.Authorized)(),
    (0, type_graphql_1.Query)(() => club_management_schema_1.ClubManagement, { nullable: true }),
    __param(0, (0, type_graphql_1.Arg)("userId")),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ClubManagementResolver.prototype, "getClubManagement", null);
__decorate([
    (0, type_graphql_1.Authorized)(),
    (0, type_graphql_1.Query)(() => club_management_schema_1.ClubManagement, { nullable: true }),
    __param(0, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ClubManagementResolver.prototype, "getCurrentUserClubDetails", null);
ClubManagementResolver = __decorate([
    (0, type_graphql_1.Resolver)(),
    __metadata("design:paramtypes", [club_management_service_1.ClubManagementService])
], ClubManagementResolver);
exports.default = ClubManagementResolver;
//# sourceMappingURL=club-management.resolver.js.map