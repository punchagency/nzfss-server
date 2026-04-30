"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogService = void 0;
const apollo_server_1 = require("apollo-server");
const logger_1 = require("../../utils/logger");
const log_schema_1 = require("../log.schema");
class LogService {
    async createLog(input) {
        try {
            const newLog = await log_schema_1.LogModel.create(input);
            return newLog;
        }
        catch (error) {
            if (error instanceof apollo_server_1.ApolloError) {
                throw error;
            }
            logger_1.logger.error("Error creating Log:", error);
            throw new apollo_server_1.ApolloError("An unexpected error occurred while creating the Logs");
        }
    }
    async getAllLogs() {
        try {
            const logs = await log_schema_1.LogModel.find().lean();
            return logs;
        }
        catch (error) {
            logger_1.logger.error(error instanceof Error ? error.message : error);
            if (error instanceof apollo_server_1.ApolloError) {
                throw error;
            }
            throw new apollo_server_1.ApolloError("Internal server error");
        }
    }
    async findLogById(input) {
        const error = " log with the given Id does not exist";
        try {
            const log = await log_schema_1.LogModel.findById(input._id).lean();
            if (!log) {
                throw new apollo_server_1.ApolloError(error);
            }
            return log;
        }
        catch (error) {
            logger_1.logger.error(error instanceof Error ? error.message : error);
            if (error instanceof apollo_server_1.ApolloError) {
                throw error;
            }
            throw new apollo_server_1.ApolloError("Internal sever error ");
        }
    }
    async deleteLog(logId) {
        try {
            const deletedLog = await log_schema_1.LogModel.findByIdAndDelete(logId).lean();
            if (!deletedLog) {
                throw new apollo_server_1.ApolloError("log with this id not found");
            }
            return deletedLog;
        }
        catch (error) {
            logger_1.logger.error(error instanceof Error ? error.message : error);
            if (error instanceof apollo_server_1.ApolloError) {
                throw error;
            }
            throw new apollo_server_1.ApolloError("Internal sever error ");
        }
    }
    async findLogsByEntityId(entityId) {
        try {
            const logs = await log_schema_1.LogModel.find({ entityId }).lean();
            if (!logs.length) {
                throw new apollo_server_1.ApolloError("No logs found for the given entityId");
            }
            return logs;
        }
        catch (error) {
            logger_1.logger.error(error instanceof Error ? error.message : error);
            if (error instanceof apollo_server_1.ApolloError) {
                throw error;
            }
            throw new apollo_server_1.ApolloError("Internal server error");
        }
    }
    async logUpdate(userId, entity, entityId, oldData, newData) {
        const logInput = {
            userId,
            action: "update",
            entity,
            entityId,
            oldData: JSON.stringify(oldData),
            newData: JSON.stringify(newData),
        };
        return this.createLog(logInput);
    }
}
exports.LogService = LogService;
//# sourceMappingURL=log.service.js.map