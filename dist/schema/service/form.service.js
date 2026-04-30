"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormService = void 0;
const apollo_server_express_1 = require("apollo-server-express");
const helpers_1 = require("../../utils/helpers");
const logger_1 = require("../../utils/logger");
const form_schema_1 = require("../form.schema");
class FormService {
    async createForm(input, user) {
        const adminErr = "Only admin can add a Form";
        try {
            const adminUser = user;
            if (!adminUser || !(0, helpers_1.isAdmin)(adminUser.role)) {
                throw new apollo_server_express_1.ApolloError(adminErr);
            }
            const newForm = await form_schema_1.FormModel.create({
                formName: input.formName,
                formType: input.formType,
                file: input.file,
                fileName: input.fileName
            });
            return newForm;
        }
        catch (error) {
            if (error instanceof apollo_server_express_1.ApolloError) {
                throw error;
            }
            logger_1.logger.error("Error creating form:", error);
            throw new apollo_server_express_1.ApolloError("An unexpected error occurred while creating the form");
        }
    }
    async getAllForms(user) {
        const isAdmin = user.role === "ADMIN";
        try {
            if (!isAdmin) {
                throw new Error("Unauthorized: Only admin can access this resource");
            }
            const yearbooks = await form_schema_1.FormModel.find().lean();
            return yearbooks;
        }
        catch (error) {
            logger_1.logger.error(error instanceof Error ? error.message : error);
            if (error instanceof apollo_server_express_1.ApolloError) {
                throw error;
            }
            throw new apollo_server_express_1.ApolloError("Internal server error");
        }
    }
    async findFormById(input, user) {
        const error = " Form with the given Id does not exist";
        const isAdmin = user.role === "ADMIN";
        try {
            if (!user || !isAdmin) {
                throw new apollo_server_express_1.ApolloError("Unauthorized: Only admin can access this resource");
            }
            const form = await form_schema_1.FormModel.findById(input.formId).lean();
            if (!form) {
                throw new apollo_server_express_1.ApolloError(error);
            }
            return form;
        }
        catch (error) {
            logger_1.logger.error(error instanceof Error ? error.message : error);
            if (error instanceof apollo_server_express_1.ApolloError) {
                throw error;
            }
            throw new apollo_server_express_1.ApolloError("Internal sever error ");
        }
    }
    async updateForm(input, user, formId) {
        const isAdmin = user.role === "ADMIN";
        try {
            if (!isAdmin) {
                throw new apollo_server_express_1.ApolloError("Unauthorized: Only admin can access this resource");
            }
            const form = await form_schema_1.FormModel.findOneAndUpdate({ _id: formId }, { $set: input }, { new: true });
            if (!form) {
                throw new apollo_server_express_1.ApolloError("Form not found or update failed");
            }
            return form;
        }
        catch (error) {
            logger_1.logger.error(error instanceof Error ? error.message : error);
            if (error instanceof apollo_server_express_1.ApolloError) {
                throw error;
            }
            throw new apollo_server_express_1.ApolloError("Internal server error ");
        }
    }
    async deleteForm(user, formId) {
        try {
            const isAdmin = user.role === "ADMIN";
            if (!user || !isAdmin) {
                return new apollo_server_express_1.ApolloError("Unauthorized: Only admin can delete this club");
            }
            const deletedForm = await form_schema_1.FormModel.findByIdAndDelete(formId).lean();
            return deletedForm;
        }
        catch (error) {
            logger_1.logger.error(error instanceof Error ? error.message : error);
            if (error instanceof apollo_server_express_1.ApolloError) {
                throw error;
            }
            throw new apollo_server_express_1.ApolloError("Internal sever error ");
        }
    }
}
exports.FormService = FormService;
//# sourceMappingURL=form.service.js.map