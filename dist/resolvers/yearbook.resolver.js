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
const yearbook_service_1 = require("../service/yearbook.service");
const yearbook_schema_1 = require("../schema/yearbook.schema");
const apollo_server_1 = require("apollo-server");
const s3Upload_1 = __importDefault(require("../utils/s3Upload"));
const upload_1 = require("../config/upload");
function validateYearbookFileSize(base64DataUri) {
    const base64Payload = base64DataUri.split(",")[1];
    if (!base64Payload) {
        throw new apollo_server_1.ApolloError("Invalid yearbook file format");
    }
    const fileSizeInBytes = Buffer.byteLength(base64Payload, "base64");
    if (fileSizeInBytes > upload_1.YEARBOOK_MAX_FILE_SIZE_BYTES) {
        throw new apollo_server_1.ApolloError(`Yearbook file exceeds ${upload_1.YEARBOOK_MAX_FILE_SIZE_MB}MB limit`);
    }
}
let YearbookResolver = class YearbookResolver {
    constructor(yearbookService) {
        this.yearbookService = yearbookService;
        this.yearbookService = new yearbook_service_1.YearbookService();
    }
    async createYearbook(context, input) {
        try {
            const { yearbook, yearbookName, yearPublish } = input;
            const user = context.user;
            let uploadedFileUrl = null;
            if (yearbook) {
                validateYearbookFileSize(yearbook);
                uploadedFileUrl = await (0, s3Upload_1.default)(yearbook, user._id, "uploads/yearbook/");
                if (!uploadedFileUrl) {
                    throw new apollo_server_1.ApolloError("Error uploading the file.");
                }
            }
            const yearbookData = {
                yearPublish,
                yearbookName,
                yearbook: uploadedFileUrl,
            };
            return await this.yearbookService.createYearbook(yearbookData, user);
        }
        catch (error) {
            console.error(error);
            throw new apollo_server_1.ApolloError("An Unexpected Error Occurred");
        }
    }
    async getAllYearbooks(context) {
        const user = context.user || null;
        return await this.yearbookService.getAllYearbooks(user);
    }
    async findYearbookById(input, context) {
        const user = context.user || null;
        const yearbook = await this.yearbookService.findYearbookById(input, user);
        return yearbook;
    }
    async updateYearbook(context, input, yearbookId) {
        try {
            const user = context.user;
            const { yearbook, yearbookName, yearPublish } = input;
            if (!user) {
                throw new apollo_server_1.ApolloError("Unauthorized: User is not authenticated");
            }
            let uploadedFileUrl = null;
            if (yearbook) {
                validateYearbookFileSize(yearbook);
                uploadedFileUrl = await (0, s3Upload_1.default)(yearbook, user._id, "uploads/yearbook/");
                if (!uploadedFileUrl) {
                    throw new apollo_server_1.ApolloError("Error uploading the file.");
                }
            }
            const yearbookData = {
                yearPublish,
                yearbookName,
                yearbook: uploadedFileUrl,
            };
            return await this.yearbookService.updateYearbook(yearbookData, user, yearbookId);
        }
        catch (error) {
            console.error(error);
            throw new apollo_server_1.ApolloError("An Unexpected Error Occurred");
        }
    }
    async deleteYearbook(context, yearbookId) {
        const user = context.user;
        if (!user) {
            throw new apollo_server_1.ApolloError("Unauthorized: User is not authenticated");
        }
        return await this.yearbookService.deleteYearbook(user, yearbookId);
    }
};
__decorate([
    (0, type_graphql_1.Authorized)(),
    (0, type_graphql_1.Mutation)(() => yearbook_schema_1.Yearbook),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("input")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, yearbook_schema_1.CreateYearbookInput]),
    __metadata("design:returntype", Promise)
], YearbookResolver.prototype, "createYearbook", null);
__decorate([
    (0, type_graphql_1.Query)(() => [yearbook_schema_1.Yearbook]),
    __param(0, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], YearbookResolver.prototype, "getAllYearbooks", null);
__decorate([
    (0, type_graphql_1.Query)(() => yearbook_schema_1.Yearbook, { nullable: true }),
    __param(0, (0, type_graphql_1.Arg)("input")),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [yearbook_schema_1.FindYearbookByIdInput, Object]),
    __metadata("design:returntype", Promise)
], YearbookResolver.prototype, "findYearbookById", null);
__decorate([
    (0, type_graphql_1.Authorized)(),
    (0, type_graphql_1.Mutation)(() => yearbook_schema_1.Yearbook),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("input")),
    __param(2, (0, type_graphql_1.Arg)("yearbookId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, yearbook_schema_1.UpdateYearbookInput,
        String]),
    __metadata("design:returntype", Promise)
], YearbookResolver.prototype, "updateYearbook", null);
__decorate([
    (0, type_graphql_1.Authorized)(),
    (0, type_graphql_1.Mutation)(() => yearbook_schema_1.Yearbook),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("yearbookId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], YearbookResolver.prototype, "deleteYearbook", null);
YearbookResolver = __decorate([
    (0, type_graphql_1.Resolver)(),
    __metadata("design:paramtypes", [yearbook_service_1.YearbookService])
], YearbookResolver);
exports.default = YearbookResolver;
//# sourceMappingURL=yearbook.resolver.js.map