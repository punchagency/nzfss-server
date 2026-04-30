"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DogsService = void 0;
const apollo_server_1 = require("apollo-server");
const logger_1 = require("../utils/logger");
const user_service_1 = __importDefault(require("./user.service"));
const dog_schema_1 = require("../schema/dog.schema");
class DogsService {
    constructor(userService) {
        this.userService = userService;
        this.userService = new user_service_1.default();
    }
    async createDogs(input, userId) {
        try {
            const newDog = await dog_schema_1.DogsModel.create({ ...input, userId });
            return newDog;
        }
        catch (error) {
            if (error instanceof apollo_server_1.ApolloError) {
                throw error;
            }
            logger_1.logger.error("Error creating Dogs:", error);
            throw new apollo_server_1.ApolloError("An unexpected error occurred while creating the Dogs");
        }
    }
    async getAllDogs() {
        try {
            const dogs = await dog_schema_1.DogsModel.find().lean();
            return dogs;
        }
        catch (error) {
            logger_1.logger.error(error instanceof Error ? error.message : error);
            if (error instanceof apollo_server_1.ApolloError) {
                throw error;
            }
            throw new apollo_server_1.ApolloError("Internal server error");
        }
    }
    async findDogsById(input) {
        const error = " Dogs with the given Id does not exist";
        try {
            const dog = await dog_schema_1.DogsModel.findById(input._id).lean();
            if (!dog) {
                throw new apollo_server_1.ApolloError(error);
            }
            return dog;
        }
        catch (error) {
            logger_1.logger.error(error instanceof Error ? error.message : error);
            if (error instanceof apollo_server_1.ApolloError) {
                throw error;
            }
            throw new apollo_server_1.ApolloError("Internal sever error ");
        }
    }
    async updateDogs(input, dogId) {
        try {
            const dog = await dog_schema_1.DogsModel.findOneAndUpdate({ _id: dogId }, { $set: input }, { new: true });
            if (!dog) {
                throw new apollo_server_1.ApolloError("Dogs not found or update failed");
            }
            return dog;
        }
        catch (error) {
            logger_1.logger.error(error instanceof Error ? error.message : error);
            if (error instanceof apollo_server_1.ApolloError) {
                throw error;
            }
            throw new apollo_server_1.ApolloError("Internal sever error ");
        }
    }
    async deleteDogs(dogId) {
        try {
            const deletedDogs = await dog_schema_1.DogsModel.findByIdAndDelete(dogId).lean();
            if (!deletedDogs) {
                throw new apollo_server_1.ApolloError("Dogs with this id not found");
            }
            return deletedDogs;
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
exports.DogsService = DogsService;
//# sourceMappingURL=dogs.service.js.map