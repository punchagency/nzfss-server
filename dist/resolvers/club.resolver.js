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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const type_graphql_1 = require("type-graphql");
const club_schema_1 = require("../schema/club.schema");
const club_service_1 = require("../service/club.service");
const apollo_server_1 = require("apollo-server");
const user_service_1 = __importDefault(require("../service/user.service"));
let ClubResolver = class ClubResolver {
    constructor(clubService, userService) {
        this.clubService = clubService;
        this.userService = userService;
        this.clubService = new club_service_1.ClubService(this.userService);
    }
    createClub(context, input) {
        return this.clubService.createClub(input, context);
    }
    async getAllClubs(context) {
        const user = context.user;
        return await this.clubService.getAllClubs(user);
    }
    async findSingleClubById(input, context) {
        const club = await this.clubService.findClubById(input, context.user);
        return club;
    }
    async updateClubDetails(context, input, clubId) {
        const user = context.user;
        if (!user) {
            throw new apollo_server_1.ApolloError("Unauthorized: User is not authenticated");
        }
        return await this.clubService.updateClub(input, user, clubId);
    }
    async deleteClub(context, clubId) {
        const user = context.user;
        if (!user) {
            throw new apollo_server_1.ApolloError("Unauthorized: User is not authenticated");
        }
        return await this.clubService.deleteClub(user, clubId);
    }
};
__decorate([
    (0, type_graphql_1.Authorized)(),
    (0, type_graphql_1.Mutation)(() => club_schema_1.Club),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("input")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, club_schema_1.CreateClubInput]),
    __metadata("design:returntype", void 0)
], ClubResolver.prototype, "createClub", null);
__decorate([
    (0, type_graphql_1.Query)(() => [club_schema_1.Club], { nullable: true }),
    __param(0, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ClubResolver.prototype, "getAllClubs", null);
__decorate([
    (0, type_graphql_1.Query)(() => club_schema_1.Club, { nullable: true }),
    __param(0, (0, type_graphql_1.Arg)("input")),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [club_schema_1.FindClubByIdInput, Object]),
    __metadata("design:returntype", Promise)
], ClubResolver.prototype, "findSingleClubById", null);
__decorate([
    (0, type_graphql_1.Authorized)(),
    (0, type_graphql_1.Mutation)(() => club_schema_1.Club),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("input")),
    __param(2, (0, type_graphql_1.Arg)("clubId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, club_schema_1.UpdateClubInput,
        String]),
    __metadata("design:returntype", Promise)
], ClubResolver.prototype, "updateClubDetails", null);
__decorate([
    (0, type_graphql_1.Authorized)(),
    (0, type_graphql_1.Mutation)(() => club_schema_1.Club),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("clubId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ClubResolver.prototype, "deleteClub", null);
ClubResolver = __decorate([
    (0, type_graphql_1.Resolver)(),
    __metadata("design:paramtypes", [club_service_1.ClubService, user_service_1.default])
], ClubResolver);
exports.default = ClubResolver;
//# sourceMappingURL=club.resolver.js.map