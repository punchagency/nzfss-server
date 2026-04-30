"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RulesService = void 0;
const apollo_server_1 = require("apollo-server");
const helpers_1 = require("../utils/helpers");
const logger_1 = require("../utils/logger");
const rules_schema_1 = require("../schema/rules.schema");
class RulesService {
    async createRules(input, user) {
        const adminErr = "Only admin can add a rules";
        try {
            const adminUser = user;
            if (!adminUser || !(0, helpers_1.isAdmin)(adminUser.role)) {
                throw new apollo_server_1.ApolloError(adminErr);
            }
            const newRules = await rules_schema_1.RulesModel.create({
                constitutionRules: input.constitutionRules,
                amendedDate: input.amendedDate,
                file: input.file,
                fileName: input?.fileName
            });
            return newRules;
        }
        catch (error) {
            if (error instanceof apollo_server_1.ApolloError) {
                throw error;
            }
            logger_1.logger.error("Error creating rules:", error);
            throw new apollo_server_1.ApolloError("An unexpected error occurred while creating the rules");
        }
    }
    async getAllRules(user) {
        try {
            if (user && user.role !== "ADMIN" && user.role !== "CLUB") {
                throw new apollo_server_1.ApolloError("Unauthorized: Only admin or club users can access this resource");
            }
            const rules = await rules_schema_1.RulesModel.find().lean();
            return rules;
        }
        catch (error) {
            logger_1.logger.error(error instanceof Error ? error.message : error);
            if (error instanceof apollo_server_1.ApolloError) {
                throw error;
            }
            throw new apollo_server_1.ApolloError("Internal server error");
        }
    }
    async findRulesById(input, user) {
        const error = " Rules with the given Id does not exist";
        const isAdmin = user.role === "ADMIN";
        try {
            if (!user || !isAdmin) {
                throw new apollo_server_1.ApolloError("Unauthorized: Only admin can access this resource");
            }
            const rules = await rules_schema_1.RulesModel.findById(input._id).lean();
            if (!rules) {
                throw new apollo_server_1.ApolloError(error);
            }
            return rules;
        }
        catch (error) {
            logger_1.logger.error(error instanceof Error ? error.message : error);
            if (error instanceof apollo_server_1.ApolloError) {
                throw error;
            }
            throw new apollo_server_1.ApolloError("Internal sever error ");
        }
    }
    async updateRules(input, user, rulesId) {
        const isAdmin = user.role === "ADMIN";
        try {
            if (!isAdmin) {
                throw new apollo_server_1.ApolloError("Unauthorized: Only admin can access this resource");
            }
            const rules = await rules_schema_1.RulesModel.findOneAndUpdate({ _id: rulesId }, { $set: input }, { new: true });
            if (!rules) {
                throw new apollo_server_1.ApolloError("Rules not found or update failed");
            }
            return rules;
        }
        catch (error) {
            logger_1.logger.error(error instanceof Error ? error.message : error);
            if (error instanceof apollo_server_1.ApolloError) {
                throw error;
            }
            throw new apollo_server_1.ApolloError("Internal server error ");
        }
    }
    async deleteRule(user, rulesId) {
        try {
            const isAdmin = user.role === "ADMIN";
            if (!user || !isAdmin) {
                return new apollo_server_1.ApolloError("Unauthorized: Only admin can delete this club");
            }
            const deletedRule = await rules_schema_1.RulesModel.findByIdAndDelete(rulesId).lean();
            if (!deletedRule) {
                throw new apollo_server_1.ApolloError("Role with this id not found");
            }
            return deletedRule;
        }
        catch (error) {
            logger_1.logger.error(error instanceof Error ? error.message : error);
            if (error instanceof apollo_server_1.ApolloError) {
                throw error;
            }
            throw new apollo_server_1.ApolloError("Internal sever error ");
        }
    }
}
exports.RulesService = RulesService;
//# sourceMappingURL=rules.service.js.map