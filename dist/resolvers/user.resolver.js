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
const user_schema_1 = require("../schema/user.schema");
const user_service_1 = __importDefault(require("../service/user.service"));
const apollo_server_1 = require("apollo-server");
const logger_1 = require("../utils/logger");
let UserResolver = class UserResolver {
    constructor(userService) {
        this.userService = userService;
        this.userService = new user_service_1.default();
    }
    createUser(input) {
        return this.userService.createUser(input);
    }
    createClub(input) {
        return this.userService.createClub(input);
    }
    login(input, context) {
        return this.userService.login(input, context);
    }
    async logout(ctx) {
        const cookieNames = ["accessToken", "authToken", "userRole"];
        const baseOptions = {
            path: "/",
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        };
        cookieNames.forEach((name) => ctx.res.clearCookie(name));
        cookieNames.forEach((name) => ctx.res.clearCookie(name, baseOptions));
        cookieNames.forEach((name) => {
            ctx.res.cookie(name, "", { ...baseOptions, maxAge: 0 });
        });
        ctx.res.cookie('logout', '1', {
            ...baseOptions,
            httpOnly: false,
            maxAge: 5 * 60 * 1000
        });
        return true;
    }
    async getCurrentUser(context) {
        try {
            return context.user;
        }
        catch (error) {
            logger_1.logger.error(`Error in getCurrentUser: ${error}`);
            throw new apollo_server_1.ApolloError("Failed to get current user");
        }
    }
    currentUser(context) {
        return context.user;
    }
    async findUserById(input, context) {
        const currentUser = context.user;
        const serverError = "Internal Server Error";
        try {
            const user = await this.userService.findUserById(input, currentUser);
            return user;
        }
        catch (error) {
            logger_1.logger.error(`${error}`);
            return new apollo_server_1.ApolloError(serverError);
        }
    }
    async findClubById(input, context) {
        const currentUser = context.user;
        try {
            const club = await this.userService.findClubById(input, currentUser);
            return club;
        }
        catch (error) {
            logger_1.logger.error(`${error}`);
            throw new apollo_server_1.ApolloError(error);
        }
    }
    async getAllUsers(context) {
        try {
            const user = context.user;
            return await this.userService.getAllUsers(user);
        }
        catch (error) {
            logger_1.logger.error('Error in getAllUsers resolver:', error);
            if (error instanceof apollo_server_1.ApolloError) {
                throw error;
            }
            throw new apollo_server_1.ApolloError('Failed to fetch users');
        }
    }
    async getAllClubs(context) {
        try {
            console.log("User resolver: getAllClubs called - public access");
            const clubs = await this.userService.getAllClubs(context.user);
            console.log(`User resolver: returning ${clubs.length} clubs`);
            return clubs;
        }
        catch (error) {
            console.error("User resolver: Error in getAllClubs:", error);
            logger_1.logger.error(`Error in getAllClubs: ${error instanceof Error ? error.stack : JSON.stringify(error)}`);
            throw new apollo_server_1.ApolloError("Failed to fetch clubs", "CLUBS_FETCH_ERROR", { originalError: error instanceof Error ? error.message : String(error) });
        }
    }
    async updateUserProfile(context, input) {
        try {
            let data = { ...input };
            const user = context.user;
            return await this.userService.updateUserProfile({
                ...data,
                user: user?._id,
            }, user);
        }
        catch (error) {
            logger_1.logger.error(error);
            throw new apollo_server_1.ApolloError("An Unexpected Error Occured");
        }
    }
    async updateClub(context, input, clubId) {
        try {
            const user = context.user;
            return await this.userService.updateClub(input, user, clubId);
        }
        catch (error) {
            logger_1.logger.error(error instanceof Error ? error.message : error);
            if (error instanceof apollo_server_1.ApolloError) {
                throw error;
            }
            throw new apollo_server_1.ApolloError("Internal sever error ");
        }
    }
    async deleteUser(userId, context) {
        const serverError = "Internal Server Error";
        const user = context.user;
        try {
            return await this.userService.deleteUser(userId, user);
        }
        catch (error) {
            logger_1.logger.error(error instanceof Error ? error.message : error);
            if (error instanceof apollo_server_1.ApolloError) {
                throw error;
            }
            throw new apollo_server_1.ApolloError("Internal sever error ");
        }
    }
    async deleteClub(clubId, context) {
        const serverError = "Internal Server Error";
        const user = context.user;
        try {
            return await this.userService.deleteClub(clubId, user);
        }
        catch (error) {
            logger_1.logger.error(error instanceof Error ? error.message : error);
            if (error instanceof apollo_server_1.ApolloError) {
                throw error;
            }
            throw new apollo_server_1.ApolloError("Internal sever error ");
        }
    }
};
__decorate([
    (0, type_graphql_1.Mutation)(() => user_schema_1.User),
    __param(0, (0, type_graphql_1.Arg)("input")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_schema_1.CreateUserInput]),
    __metadata("design:returntype", void 0)
], UserResolver.prototype, "createUser", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => user_schema_1.User),
    __param(0, (0, type_graphql_1.Arg)("input")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_schema_1.CreateUserInput]),
    __metadata("design:returntype", void 0)
], UserResolver.prototype, "createClub", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => user_schema_1.LoginResponse),
    __param(0, (0, type_graphql_1.Arg)("input")),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_schema_1.LoginInput, Object]),
    __metadata("design:returntype", void 0)
], UserResolver.prototype, "login", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Boolean),
    __param(0, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "logout", null);
__decorate([
    (0, type_graphql_1.Query)(() => user_schema_1.User, { nullable: true }),
    __param(0, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "getCurrentUser", null);
__decorate([
    (0, type_graphql_1.Query)(() => user_schema_1.User, { nullable: true }),
    __param(0, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UserResolver.prototype, "currentUser", null);
__decorate([
    (0, type_graphql_1.Query)(() => user_schema_1.User, { nullable: true }),
    __param(0, (0, type_graphql_1.Arg)("input")),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_schema_1.FindUserByIdInput, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "findUserById", null);
__decorate([
    (0, type_graphql_1.Query)(() => user_schema_1.User, { nullable: true }),
    __param(0, (0, type_graphql_1.Arg)("input")),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_schema_1.FindUserByIdInput, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "findClubById", null);
__decorate([
    (0, type_graphql_1.Query)(() => [user_schema_1.User], { nullable: true }),
    __param(0, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "getAllUsers", null);
__decorate([
    (0, type_graphql_1.Query)(() => [user_schema_1.User], { nullable: true }),
    __param(0, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "getAllClubs", null);
__decorate([
    (0, type_graphql_1.Authorized)(),
    (0, type_graphql_1.Mutation)(() => user_schema_1.User),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("input")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, user_schema_1.UpdateUserInput]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "updateUserProfile", null);
__decorate([
    (0, type_graphql_1.Authorized)(),
    (0, type_graphql_1.Mutation)(() => user_schema_1.User),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("input")),
    __param(2, (0, type_graphql_1.Arg)("clubId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, user_schema_1.UpdateUserInput,
        String]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "updateClub", null);
__decorate([
    (0, type_graphql_1.Authorized)(),
    (0, type_graphql_1.Mutation)(() => user_schema_1.User),
    __param(0, (0, type_graphql_1.Arg)("userId")),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "deleteUser", null);
__decorate([
    (0, type_graphql_1.Authorized)(),
    (0, type_graphql_1.Mutation)(() => user_schema_1.User),
    __param(0, (0, type_graphql_1.Arg)("clubId")),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "deleteClub", null);
UserResolver = __decorate([
    (0, type_graphql_1.Resolver)(),
    __metadata("design:paramtypes", [user_service_1.default])
], UserResolver);
exports.default = UserResolver;
//# sourceMappingURL=user.resolver.js.map