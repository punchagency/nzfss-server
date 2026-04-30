"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntrantService = void 0;
const apollo_server_1 = require("apollo-server");
const logger_1 = require("../../utils/logger");
const entrants_schema_1 = require("../entrants.schema");
const log_service_1 = require("./log.service");
class EntrantService {
    constructor(logService) {
        this.logService = logService;
        this.logService = new log_service_1.LogService();
    }
    async createEntrant(input, userId) {
        try {
            const newEntrant = await entrants_schema_1.EntrantModel.create({ ...input, userId });
            return newEntrant;
        }
        catch (error) {
            if (error instanceof apollo_server_1.ApolloError) {
                throw error;
            }
            logger_1.logger.error("Error creating entrant:", error);
            throw new apollo_server_1.ApolloError("An unexpected error occurred while creating the entrant");
        }
    }
    async getAllEntrants() {
        try {
            const Entrants = await entrants_schema_1.EntrantModel.find().lean();
            return Entrants;
        }
        catch (error) {
            logger_1.logger.error(error instanceof Error ? error.message : error);
            if (error instanceof apollo_server_1.ApolloError) {
                throw error;
            }
            throw new apollo_server_1.ApolloError("Internal server error");
        }
    }
    async findEntrantById(input) {
        const error = " Entrant with the given Id does not exist";
        try {
            const entrant = await entrants_schema_1.EntrantModel.findById(input._id).lean();
            if (!entrant) {
                throw new apollo_server_1.ApolloError(error);
            }
            return entrant;
        }
        catch (error) {
            logger_1.logger.error(error instanceof Error ? error.message : error);
            if (error instanceof apollo_server_1.ApolloError) {
                throw error;
            }
            throw new apollo_server_1.ApolloError("Internal sever error ");
        }
    }
    async updateEntrant(input, entrantId, userId) {
        try {
            const oldEntrant = await entrants_schema_1.EntrantModel.findById(entrantId).lean();
            if (!oldEntrant) {
                throw new apollo_server_1.ApolloError("Result not found");
            }
            const updatedEntrant = await entrants_schema_1.EntrantModel.findByIdAndUpdate(entrantId, input, { new: true }).lean();
            if (!updatedEntrant) {
                throw new apollo_server_1.ApolloError("Error updating entrant");
            }
            const changes = this.getChanges(oldEntrant, updatedEntrant);
            await this.logService.logUpdate(userId, "result", entrantId, changes.oldData, changes.newData);
            return updatedEntrant;
        }
        catch (error) {
            logger_1.logger.error(error instanceof Error ? error.message : error);
            if (error instanceof apollo_server_1.ApolloError) {
                throw error;
            }
            throw new apollo_server_1.ApolloError("Internal sever error ");
        }
    }
    async deleteEntrant(entrantId) {
        try {
            const deletedEntrant = await entrants_schema_1.EntrantModel.findByIdAndDelete(entrantId).lean();
            if (!deletedEntrant) {
                throw new apollo_server_1.ApolloError("Entrant with this id not found");
            }
            return deletedEntrant;
        }
        catch (error) {
            logger_1.logger.error(error instanceof Error ? error.message : error);
            if (error instanceof apollo_server_1.ApolloError) {
                throw error;
            }
            throw new apollo_server_1.ApolloError("Internal sever error ");
        }
    }
    getChanges(oldData, newData) {
        const changes = {
            oldData: {},
            newData: {}
        };
        for (const key in newData) {
            if (newData[key] !== oldData[key]) {
                changes.oldData[key] = oldData[key];
                changes.newData[key] = newData[key];
            }
        }
        return changes;
    }
}
exports.EntrantService = EntrantService;
//# sourceMappingURL=entrant.service.js.map