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
const rules_schema_1 = require("../schema/rules.schema");
const rules_service_1 = require("../service/rules.service");
const logger_1 = require("../utils/logger");
const s3Upload_1 = __importDefault(require("../utils/s3Upload"));
const lodash_1 = __importDefault(require("lodash"));
let RulesResolver = class RulesResolver {
    constructor(rulesService) {
        this.rulesService = rulesService;
        this.rulesService = new rules_service_1.RulesService();
    }
    async createRules(context, input) {
        try {
            const { file, amendedDate, constitutionRules, fileName } = input;
            const user = context.user;
            const uploadedFileUrl = await (0, s3Upload_1.default)(file, user._id, "uploads/rules/");
            if (!uploadedFileUrl) {
                throw new apollo_server_1.ApolloError("Error uploading the file.");
            }
            const formData = {
                amendedDate,
                constitutionRules,
                file: uploadedFileUrl,
                fileName,
            };
            return await this.rulesService.createRules(formData, user);
        }
        catch (error) {
            throw new apollo_server_1.ApolloError("An Unexpected Error Occurred");
        }
    }
    async getAllRules(context) {
        const user = context.user || null;
        try {
            return await this.rulesService.getAllRules(user);
        }
        catch (error) {
            logger_1.logger.error(error instanceof Error ? error.message : error);
            throw new apollo_server_1.ApolloError("Internal server error");
        }
    }
    async findRulesById(input, context) {
        const user = context.user;
        const rule = await this.rulesService.findRulesById(input, user);
        return rule;
    }
    async updateRules(context, input, rulesId) {
        try {
            const { file, amendedDate, constitutionRules, fileName } = input;
            const updateData = lodash_1.default.pickBy({
                file,
                amendedDate,
                constitutionRules,
                fileName,
            }, (value) => value != null);
            if (Object.keys(updateData).length === 0) {
                throw new apollo_server_1.ApolloError("Please provide at least one field to update");
            }
            const user = context.user;
            let uploadedFileUrl = null;
            if (file) {
                uploadedFileUrl = await (0, s3Upload_1.default)(file, user._id, "uploads/rules/");
                if (!uploadedFileUrl) {
                    throw new apollo_server_1.ApolloError("Error uploading the file.");
                }
            }
            const formData = {
                ...updateData,
                file: uploadedFileUrl ? uploadedFileUrl : updateData.file,
            };
            return await this.rulesService.updateRules(formData, user, rulesId);
        }
        catch (error) {
            throw new apollo_server_1.ApolloError("Internal server error: " + error);
        }
    }
    async deleteRules(context, rulesId) {
        const user = context.user;
        if (!user) {
            throw new apollo_server_1.ApolloError("Unauthorized: User is not authenticated");
        }
        try {
            return await this.rulesService.deleteRule(user, rulesId);
        }
        catch (error) {
            throw new apollo_server_1.ApolloError(`${error}`);
        }
    }
};
__decorate([
    (0, type_graphql_1.Authorized)(),
    (0, type_graphql_1.Mutation)(() => rules_schema_1.Rules),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("input")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, rules_schema_1.CreateRulesInput]),
    __metadata("design:returntype", Promise)
], RulesResolver.prototype, "createRules", null);
__decorate([
    (0, type_graphql_1.Query)(() => [rules_schema_1.Rules], { nullable: true }),
    __param(0, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RulesResolver.prototype, "getAllRules", null);
__decorate([
    (0, type_graphql_1.Authorized)(),
    (0, type_graphql_1.Query)(() => rules_schema_1.Rules, { nullable: true }),
    __param(0, (0, type_graphql_1.Arg)("input")),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [rules_schema_1.FindRulesByIdInput, Object]),
    __metadata("design:returntype", Promise)
], RulesResolver.prototype, "findRulesById", null);
__decorate([
    (0, type_graphql_1.Authorized)(),
    (0, type_graphql_1.Mutation)(() => rules_schema_1.Rules),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("input")),
    __param(2, (0, type_graphql_1.Arg)("rulesId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, rules_schema_1.UpdateRulesInput,
        String]),
    __metadata("design:returntype", Promise)
], RulesResolver.prototype, "updateRules", null);
__decorate([
    (0, type_graphql_1.Authorized)(),
    (0, type_graphql_1.Mutation)(() => rules_schema_1.Rules),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("rulesId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], RulesResolver.prototype, "deleteRules", null);
RulesResolver = __decorate([
    (0, type_graphql_1.Resolver)(),
    __metadata("design:paramtypes", [rules_service_1.RulesService])
], RulesResolver);
exports.default = RulesResolver;
//# sourceMappingURL=rules.resolver.js.map