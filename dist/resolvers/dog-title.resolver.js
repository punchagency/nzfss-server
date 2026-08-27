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
exports.DogTitleResolver = void 0;
const type_graphql_1 = require("type-graphql");
const apollo_server_1 = require("apollo-server");
const dog_title_schema_1 = require("../schema/dog-title.schema");
const dog_title_service_1 = require("../service/dog-title.service");
const log_service_1 = require("../service/log.service");
const logger_1 = require("../utils/logger");
let DogTitleResolver = class DogTitleResolver {
    constructor() {
        this.logService = new log_service_1.LogService();
    }
    async getUnrecognisedTitleChanges() {
        try {
            return await (0, dog_title_service_1.getUnrecognisedTitleChanges)();
        }
        catch (error) {
            console.error("Error computing unrecognised title changes:", error);
            throw new apollo_server_1.ApolloError(`Failed to compute title changes: ${error.message}`);
        }
    }
    async recogniseTitleChanges(input, context) {
        try {
            if (!input.dogIds || input.dogIds.length === 0) {
                return {
                    success: true,
                    recognisedCount: 0,
                    message: "No dogs provided.",
                };
            }
            const recognised = await (0, dog_title_service_1.recogniseTitleChanges)(input.dogIds);
            if (recognised.length > 0) {
                const written = await Promise.allSettled(recognised.map((dog) => this.logService.createLog({
                    userId: String(context.user?._id || ""),
                    action: "recognise-title",
                    entity: "dogTitle",
                    entityId: dog.dogId,
                    oldData: JSON.stringify({ title: dog.previousTitle }),
                    newData: JSON.stringify(dog),
                })));
                const failed = written.filter((entry) => entry.status === "rejected").length;
                if (failed > 0) {
                    logger_1.logger.error(`Recognised ${recognised.length} title(s) but failed to log ${failed} of them.`);
                }
            }
            return {
                success: true,
                recognisedCount: recognised.length,
                message: `Recognised titles for ${recognised.length} dog(s).`,
            };
        }
        catch (error) {
            console.error("Error recognising title changes:", error);
            throw new apollo_server_1.ApolloError(`Failed to recognise title changes: ${error.message}`);
        }
    }
};
exports.DogTitleResolver = DogTitleResolver;
__decorate([
    (0, type_graphql_1.Authorized)(),
    (0, type_graphql_1.Query)(() => [dog_title_schema_1.UnrecognisedTitleChange]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DogTitleResolver.prototype, "getUnrecognisedTitleChanges", null);
__decorate([
    (0, type_graphql_1.Authorized)(),
    (0, type_graphql_1.Mutation)(() => dog_title_schema_1.RecogniseTitleChangesResponse),
    __param(0, (0, type_graphql_1.Arg)("input")),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dog_title_schema_1.RecogniseTitleChangesInput, Object]),
    __metadata("design:returntype", Promise)
], DogTitleResolver.prototype, "recogniseTitleChanges", null);
exports.DogTitleResolver = DogTitleResolver = __decorate([
    (0, type_graphql_1.Resolver)()
], DogTitleResolver);
//# sourceMappingURL=dog-title.resolver.js.map