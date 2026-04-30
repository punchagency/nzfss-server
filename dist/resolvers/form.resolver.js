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
const form_schema_1 = require("../schema/form.schema");
const form_service_1 = require("../service/form.service");
const logger_1 = require("../utils/logger");
let FormResolver = class FormResolver {
    constructor(formService) {
        this.formService = formService;
        this.formService = new form_service_1.FormService();
    }
    async createForm(context, input) {
        try {
            const { file, formName, formType, fileName } = input;
            const user = context.user;
            if (!file && formType !== "new" && formType !== "renewal" && formType !== "change") {
                logger_1.logger.error("File is required but was not provided");
                throw new apollo_server_1.ApolloError("File is required for form creation.");
            }
            if (file) {
                logger_1.logger.info(`Received file for upload. Name: ${fileName || "unnamed"}, Length: ${file.length}`);
                logger_1.logger.info(`File prefix (first 50 chars): "${file.substring(0, 50)}"`);
            }
            try {
                logger_1.logger.info(`Creating form in database: ${formName}, type: ${formType}`);
                return await this.formService.createForm(input, user);
            }
            catch (error) {
                logger_1.logger.error(`Error during form creation: ${error instanceof Error ? error.message : "Unknown error"}`);
                logger_1.logger.error(`Error details: ${JSON.stringify(error)}`);
                throw new apollo_server_1.ApolloError(`Error creating form: ${error instanceof Error ? error.message : "Unknown error"}`);
            }
        }
        catch (error) {
            if (error instanceof apollo_server_1.ApolloError) {
                logger_1.logger.error(`Apollo error in createForm: ${error.message}`);
                throw error;
            }
            logger_1.logger.error(`Unexpected error in createForm: ${error instanceof Error ? error.message : "Unknown error"}`);
            logger_1.logger.error(`Error stack: ${error instanceof Error ? error.stack : "No stack available"}`);
            throw new apollo_server_1.ApolloError("An unexpected error occurred while creating the form. Please try again.");
        }
    }
    async getAllForms(context) {
        const user = context.user || null;
        try {
            return await this.formService.getAllForms(user);
        }
        catch (error) {
            logger_1.logger.error(error instanceof Error ? error.message : error);
            throw new apollo_server_1.ApolloError("Internal server error");
        }
    }
    async forms(context, formType, status, clubId) {
        const user = context.user || null;
        try {
            return await this.formService.getForms(user, formType, status, clubId);
        }
        catch (error) {
            logger_1.logger.error(error instanceof Error ? error.message : error);
            throw new apollo_server_1.ApolloError("Internal server error");
        }
    }
    async findFormById(input, context) {
        const user = context.user;
        const form = await this.formService.findFormById(input, user);
        return form;
    }
    async updateForm(context, formId, input) {
        try {
            const { file, formName, formType, fileName } = input;
            const user = context.user;
            logger_1.logger.info(`Updating form: ${formId}`);
            if (file) {
                logger_1.logger.info(`Update includes file. File length: ${file.length}`);
                logger_1.logger.info(`File prefix: ${file.substring(0, 50)}`);
            }
            return await this.formService.updateForm(input, user, formId);
        }
        catch (error) {
            logger_1.logger.error(`Error in updateForm: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
            if (error instanceof apollo_server_1.ApolloError) {
                throw error;
            }
            throw new apollo_server_1.ApolloError("Internal server error: " + (error instanceof Error ? error.message : "Unknown error"));
        }
    }
    async deleteForm(context, formId) {
        const user = context.user;
        if (!user) {
            throw new apollo_server_1.ApolloError("Unauthorized: User is not authenticated");
        }
        return await this.formService.deleteForm(user, formId);
    }
    async approveForm(context, id) {
        try {
            const user = context.user;
            if (!user) {
                throw new apollo_server_1.ApolloError("Unauthorized: User is not authenticated");
            }
            return await this.formService.updateFormStatus(id, "approved", user);
        }
        catch (error) {
            logger_1.logger.error(`Error in approveForm: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
            if (error instanceof apollo_server_1.ApolloError) {
                throw error;
            }
            throw new apollo_server_1.ApolloError("Error approving form: " + (error instanceof Error ? error.message : "Unknown error"));
        }
    }
    async declineForm(context, id) {
        try {
            const user = context.user;
            if (!user) {
                throw new apollo_server_1.ApolloError("Unauthorized: User is not authenticated");
            }
            return await this.formService.updateFormStatus(id, "declined", user);
        }
        catch (error) {
            logger_1.logger.error(`Error in declineForm: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
            if (error instanceof apollo_server_1.ApolloError) {
                throw error;
            }
            throw new apollo_server_1.ApolloError("Error declining form: " + (error instanceof Error ? error.message : "Unknown error"));
        }
    }
};
__decorate([
    (0, type_graphql_1.Mutation)(() => form_schema_1.Form),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("input")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, form_schema_1.CreateFormInput]),
    __metadata("design:returntype", Promise)
], FormResolver.prototype, "createForm", null);
__decorate([
    (0, type_graphql_1.Query)(() => [form_schema_1.Form], { nullable: true }),
    __param(0, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FormResolver.prototype, "getAllForms", null);
__decorate([
    (0, type_graphql_1.Query)(() => [form_schema_1.Form], { nullable: true }),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("formType", { nullable: true })),
    __param(2, (0, type_graphql_1.Arg)("status", { nullable: true })),
    __param(3, (0, type_graphql_1.Arg)("clubId", { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], FormResolver.prototype, "forms", null);
__decorate([
    (0, type_graphql_1.Authorized)(),
    (0, type_graphql_1.Query)(() => form_schema_1.Form, { nullable: true }),
    __param(0, (0, type_graphql_1.Arg)("input")),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [form_schema_1.FindFormByIdInput, Object]),
    __metadata("design:returntype", Promise)
], FormResolver.prototype, "findFormById", null);
__decorate([
    (0, type_graphql_1.Authorized)(),
    (0, type_graphql_1.Mutation)(() => form_schema_1.Form),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("formId")),
    __param(2, (0, type_graphql_1.Arg)("input")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String,
        form_schema_1.UpdateFormInput]),
    __metadata("design:returntype", Promise)
], FormResolver.prototype, "updateForm", null);
__decorate([
    (0, type_graphql_1.Authorized)(),
    (0, type_graphql_1.Mutation)(() => form_schema_1.Form),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("formId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], FormResolver.prototype, "deleteForm", null);
__decorate([
    (0, type_graphql_1.Authorized)(),
    (0, type_graphql_1.Mutation)(() => form_schema_1.Form),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], FormResolver.prototype, "approveForm", null);
__decorate([
    (0, type_graphql_1.Authorized)(),
    (0, type_graphql_1.Mutation)(() => form_schema_1.Form),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], FormResolver.prototype, "declineForm", null);
FormResolver = __decorate([
    (0, type_graphql_1.Resolver)(),
    __metadata("design:paramtypes", [form_service_1.FormService])
], FormResolver);
exports.default = FormResolver;
//# sourceMappingURL=form.resolver.js.map