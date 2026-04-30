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
const log_schema_1 = require("../schema/log.schema");
const log_service_1 = require("../service/log.service");
let LogsResolver = class LogsResolver {
    constructor(logService) {
        this.logService = logService;
        this.logService = new log_service_1.LogService();
    }
    createLog(context, input) {
        return this.logService.createLog(input);
    }
    async getAllLogs(context) {
        const user = context.user;
        if (!user)
            (new apollo_server_1.ApolloError("User must be authenticated"));
        return await this.logService.getAllLogs();
    }
    async findSingleLogsById(input, context) {
        const user = context.user;
        if (!user)
            (new apollo_server_1.ApolloError("User must be authenticated"));
        const log = await this.logService.findLogById(input);
        return log;
    }
    async findLogsByEntrantId(entrantId, context) {
        const user = context.user;
        if (!user) {
            throw new apollo_server_1.ApolloError("User must be authenticated");
        }
        const logs = await this.logService.findLogsByEntityId(entrantId);
        return logs;
    }
    async deleteLog(context, logId) {
        const user = context.user;
        if (!user) {
            throw new apollo_server_1.ApolloError("Unauthorized: User is not authenticated");
        }
        return await this.logService.deleteLog(logId);
    }
};
__decorate([
    (0, type_graphql_1.Authorized)(),
    (0, type_graphql_1.Mutation)(() => log_schema_1.Log),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("input")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, log_schema_1.CreateLogInput]),
    __metadata("design:returntype", void 0)
], LogsResolver.prototype, "createLog", null);
__decorate([
    (0, type_graphql_1.Authorized)(),
    (0, type_graphql_1.Query)(() => [log_schema_1.Log], { nullable: true }),
    __param(0, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LogsResolver.prototype, "getAllLogs", null);
__decorate([
    (0, type_graphql_1.Authorized)(),
    (0, type_graphql_1.Query)(() => log_schema_1.Log, { nullable: true }),
    __param(0, (0, type_graphql_1.Arg)("input")),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [log_schema_1.FindLogsByIdInput, Object]),
    __metadata("design:returntype", Promise)
], LogsResolver.prototype, "findSingleLogsById", null);
__decorate([
    (0, type_graphql_1.Authorized)(),
    (0, type_graphql_1.Query)(() => [log_schema_1.Log], { nullable: true }),
    __param(0, (0, type_graphql_1.Arg)("entrantId")),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LogsResolver.prototype, "findLogsByEntrantId", null);
__decorate([
    (0, type_graphql_1.Authorized)(),
    (0, type_graphql_1.Mutation)(() => log_schema_1.Log),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("logId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], LogsResolver.prototype, "deleteLog", null);
LogsResolver = __decorate([
    (0, type_graphql_1.Resolver)(),
    __metadata("design:paramtypes", [log_service_1.LogService])
], LogsResolver);
exports.default = LogsResolver;
//# sourceMappingURL=logs.resolver.js.map