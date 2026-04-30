"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.YearbookService = void 0;
const apollo_server_1 = require("apollo-server");
const helpers_1 = require("../../utils/helpers");
const logger_1 = require("../../utils/logger");
const yearbook_schema_1 = require("../yearbook.schema");
class YearbookService {
    async createYearbook(input, user) {
        const adminErr = "Only admin can add a yearbook";
        try {
            const adminUser = user;
            if (!adminUser || !(0, helpers_1.isAdmin)(adminUser.role)) {
                throw new apollo_server_1.ApolloError(adminErr);
            }
            const newYearbook = await yearbook_schema_1.YearbookModel.create(input);
            return newYearbook;
        }
        catch (error) {
            if (error instanceof apollo_server_1.ApolloError) {
                throw error;
            }
            logger_1.logger.error("Error creating Yearbook:", error);
            throw new apollo_server_1.ApolloError("An unexpected error occurred while creating the Yearbook");
        }
    }
    async getAllYearbooks(user) {
        const isAdmin = user.role === "ADMIN";
        try {
            if (!isAdmin) {
                throw new Error("Unauthorized: Only admin can access this resource");
            }
            const yearbooks = await yearbook_schema_1.YearbookModel.find()
                .sort({ createdAt: -1 })
                .lean();
            return yearbooks;
        }
        catch (error) {
            logger_1.logger.error(error instanceof Error ? error.message : error);
            if (error instanceof apollo_server_1.ApolloError) {
                throw error;
            }
            throw new apollo_server_1.ApolloError("Internal server error");
        }
    }
    async findYearbookById(input, user) {
        const error = " Yearbook with the given Id does not exist";
        const isAdmin = user.role === "ADMIN";
        try {
            if (!user || !isAdmin) {
                throw new apollo_server_1.ApolloError("Unauthorized: Only admin can access this resource");
            }
            const yearbook = await yearbook_schema_1.YearbookModel.findById(input._id).lean();
            if (!yearbook) {
                throw new apollo_server_1.ApolloError(error);
            }
            return yearbook;
        }
        catch (error) {
            logger_1.logger.error(error instanceof Error ? error.message : error);
            if (error instanceof apollo_server_1.ApolloError) {
                throw error;
            }
            throw new apollo_server_1.ApolloError("Internal sever error ");
        }
    }
    async updateYearbook(input, user, yearbookId) {
        const isAdmin = user.role === "ADMIN";
        try {
            if (!isAdmin) {
                throw new apollo_server_1.ApolloError("Unauthorized: Only admin can access this resource");
            }
            const yearbook = await yearbook_schema_1.YearbookModel.findOneAndUpdate({ _id: yearbookId }, { $set: input }, { new: true });
            if (!yearbook) {
                throw new apollo_server_1.ApolloError("Yearbook not found or update failed");
            }
            return yearbook;
        }
        catch (error) {
            logger_1.logger.error(error instanceof Error ? error.message : error);
            if (error instanceof apollo_server_1.ApolloError) {
                throw error;
            }
            throw new apollo_server_1.ApolloError("Internal server error ");
        }
    }
    async deleteYearbook(user, yearbookId) {
        try {
            const isAdmin = user.role === "ADMIN";
            if (!user || !isAdmin) {
                return new apollo_server_1.ApolloError("Unauthorized: Only admin can delete this club");
            }
            const deletedYearbook = await yearbook_schema_1.YearbookModel.findByIdAndDelete(yearbookId).lean();
            return deletedYearbook;
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
exports.YearbookService = YearbookService;
//# sourceMappingURL=yearbook.service.js.map