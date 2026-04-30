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
const apollo_server_1 = require("apollo-server");
const user_service_1 = __importDefault(require("../service/user.service"));
const dog_schema_1 = require("../schema/dog.schema");
const dogs_service_1 = require("../service/dogs.service");
let DogsResolver = class DogsResolver {
    constructor(dogsService, userService) {
        this.dogsService = dogsService;
        this.userService = userService;
        this.dogsService = new dogs_service_1.DogsService(this.userService);
    }
    createDog(context, input) {
        const userId = context.user?._id;
        return this.dogsService.createDogs(input, userId);
    }
    async getAllDogs(context) {
        const user = context.user;
        if (!user)
            (new apollo_server_1.ApolloError("User must be authenticated"));
        return await this.dogsService.getAllDogs();
    }
    async findSingleDogsById(input, context) {
        const user = context.user;
        if (!user)
            (new apollo_server_1.ApolloError("User must be authenticated"));
        const Dogs = await this.dogsService.findDogsById(input);
        return Dogs;
    }
    async updateDogsDetails(context, input, dogId) {
        const user = context.user;
        if (!user) {
            throw new apollo_server_1.ApolloError("Unauthorized: User is not authenticated");
        }
        return await this.dogsService.updateDogs(input, dogId);
    }
    async deleteDog(context, dogId) {
        const user = context.user;
        if (!user) {
            throw new apollo_server_1.ApolloError("Unauthorized: User is not authenticated");
        }
        return await this.dogsService.deleteDogs(dogId);
    }
};
__decorate([
    (0, type_graphql_1.Authorized)(),
    (0, type_graphql_1.Mutation)(() => dog_schema_1.Dogs),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("input")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dog_schema_1.CreateDogInput]),
    __metadata("design:returntype", void 0)
], DogsResolver.prototype, "createDog", null);
__decorate([
    (0, type_graphql_1.Authorized)(),
    (0, type_graphql_1.Query)(() => [dog_schema_1.Dogs], { nullable: true }),
    __param(0, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DogsResolver.prototype, "getAllDogs", null);
__decorate([
    (0, type_graphql_1.Authorized)(),
    (0, type_graphql_1.Query)(() => dog_schema_1.Dogs, { nullable: true }),
    __param(0, (0, type_graphql_1.Arg)("input")),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dog_schema_1.FindDogsByIdInput, Object]),
    __metadata("design:returntype", Promise)
], DogsResolver.prototype, "findSingleDogsById", null);
__decorate([
    (0, type_graphql_1.Authorized)(),
    (0, type_graphql_1.Mutation)(() => dog_schema_1.Dogs),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("input")),
    __param(2, (0, type_graphql_1.Arg)("dogId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dog_schema_1.UpdateDogsInput,
        String]),
    __metadata("design:returntype", Promise)
], DogsResolver.prototype, "updateDogsDetails", null);
__decorate([
    (0, type_graphql_1.Authorized)(),
    (0, type_graphql_1.Mutation)(() => dog_schema_1.Dogs),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("dogId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], DogsResolver.prototype, "deleteDog", null);
DogsResolver = __decorate([
    (0, type_graphql_1.Resolver)(),
    __metadata("design:paramtypes", [dogs_service_1.DogsService, user_service_1.default])
], DogsResolver);
exports.default = DogsResolver;
//# sourceMappingURL=dogs.resolver.js.map