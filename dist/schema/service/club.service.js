"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClubService = void 0;
const apollo_server_1 = require("apollo-server");
const club_schema_1 = require("../club.schema");
const helpers_1 = require("../../utils/helpers");
const logger_1 = require("../../utils/logger");
const user_service_1 = __importDefault(require("./user.service"));
const validateCheck_1 = require("../../utils/validateCheck");
class ClubService {
    constructor(userService) {
        this.userService = userService;
        this.userService = new user_service_1.default();
    }
    async createClub(input, context) {
        const adminErr = "Only admin can add a club";
        const passwordErr = "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character (@#$&*-^!).";
        try {
            if (!validateCheck_1.Validate.isValidPassword(input.password)) {
                throw new apollo_server_1.ApolloError(passwordErr);
            }
            const adminUser = context.user;
            if (!adminUser || !(0, helpers_1.isAdmin)(adminUser.role)) {
                throw new apollo_server_1.ApolloError(adminErr);
            }
            const newClub = await club_schema_1.ClubModel.create(input);
            return newClub;
        }
        catch (error) {
            if (error instanceof apollo_server_1.ApolloError) {
                throw error;
            }
            logger_1.logger.error("Error creating club:", error);
            throw new apollo_server_1.ApolloError("An unexpected error occurred while creating the club");
        }
    }
    async getAllClubs(user) {
        const isAdmin = user.role === "ADMIN";
        try {
            if (!isAdmin) {
                throw new Error("Unauthorized: Only admin can access this resource");
            }
            const clubs = await club_schema_1.ClubModel.find().lean();
            return clubs;
        }
        catch (error) {
            logger_1.logger.error(error instanceof Error ? error.message : error);
            if (error instanceof apollo_server_1.ApolloError) {
                throw error;
            }
            throw new apollo_server_1.ApolloError("Internal server error");
        }
    }
    async findClubById(input, user) {
        const error = " Club with the given Id does not exist";
        const isAdmin = user.role === "ADMIN";
        try {
            if (!user || !isAdmin) {
                throw new apollo_server_1.ApolloError("Unauthorized: Only admin can access this resource");
            }
            const club = await club_schema_1.ClubModel.findById(input._id).lean();
            if (!club) {
                throw new apollo_server_1.ApolloError(error);
            }
            return club;
        }
        catch (error) {
            logger_1.logger.error(error instanceof Error ? error.message : error);
            if (error instanceof apollo_server_1.ApolloError) {
                throw error;
            }
            throw new apollo_server_1.ApolloError("Internal sever error ");
        }
    }
    async updateClub(input, user, clubId) {
        const passwordErr = "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character (@#$&*-^!).";
        const isAdmin = user.role === "ADMIN";
        try {
            if (!isAdmin) {
                throw new apollo_server_1.ApolloError("Unauthorized: Only admin can access this resource");
            }
            if (input.password &&
                input.confirmPassword &&
                input.password !== input.confirmPassword) {
                throw new apollo_server_1.ApolloError("Password and confirm password must match");
            }
            if (!validateCheck_1.Validate.isValidPassword(input.password)) {
                throw new apollo_server_1.ApolloError(passwordErr);
            }
            const club = await club_schema_1.ClubModel.findOneAndUpdate({ _id: clubId }, { $set: input }, { new: true });
            if (!club) {
                throw new apollo_server_1.ApolloError("Club not found or update failed");
            }
            return club;
        }
        catch (error) {
            logger_1.logger.error(error instanceof Error ? error.message : error);
            if (error instanceof apollo_server_1.ApolloError) {
                throw error;
            }
            throw new apollo_server_1.ApolloError("Internal sever error ");
        }
    }
    async deleteClub(user, clubId) {
        try {
            const isAdmin = user.role === "ADMIN";
            if (!user || !isAdmin) {
                throw new apollo_server_1.ApolloError("Unauthorized: Only admin can delete this club");
            }
            const deletedClub = await club_schema_1.ClubModel.findByIdAndDelete(clubId).lean();
            if (!deletedClub) {
                throw new apollo_server_1.ApolloError("Club with this id not found");
            }
            return deletedClub;
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
exports.ClubService = ClubService;
//# sourceMappingURL=club.service.js.map