"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const apollo_server_1 = require("apollo-server");
const user_schema_1 = require("../schema/user.schema");
const club_schema_1 = require("../schema/club.schema");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jwt_1 = require("../utils/jwt");
const validateCheck_1 = require("../utils/validateCheck");
const logger_1 = require("../utils/logger");
class UserService {
    constructor() {
        this.fixUsersWithNullNames().catch(error => {
            logger_1.logger.error('Error fixing users with null names:', error);
        });
    }
    async fixUsersWithNullNames() {
        try {
            const usersWithNullNames = await user_schema_1.UserModel.find({
                $or: [
                    { name: null },
                    { name: { $exists: false } }
                ]
            }).lean();
            if (usersWithNullNames.length > 0) {
                logger_1.logger.warn(`Found ${usersWithNullNames.length} users with null names, fixing...`);
                for (const user of usersWithNullNames) {
                    let defaultName;
                    if (user.email) {
                        defaultName = user.email.split('@')[0];
                    }
                    else {
                        defaultName = `user_${Date.now()}`;
                        logger_1.logger.warn(`User ${user._id} has no email, using generic name: ${defaultName}`);
                    }
                    try {
                        await user_schema_1.UserModel.findByIdAndUpdate(user._id, {
                            name: defaultName
                        });
                        logger_1.logger.info(`Fixed user ${user._id} with name: ${defaultName}`);
                    }
                    catch (updateError) {
                        logger_1.logger.error(`Failed to update user ${user._id}:`, updateError);
                        continue;
                    }
                }
            }
        }
        catch (error) {
            logger_1.logger.error('Error in fixUsersWithNullNames:', error);
        }
    }
    async createUser(input) {
        const emailErr = `User with email: ${input.email} already exits`;
        const passwordErr = 'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character (@#$&*-^!).';
        const emailInput = input.email.toLowerCase();
        try {
            if (!validateCheck_1.Validate.isValidPassword(input.password)) {
                throw new apollo_server_1.ApolloError(passwordErr);
            }
            const existingUser = await user_schema_1.UserModel.find().findByEmail(input.email).lean();
            if (existingUser) {
                throw new apollo_server_1.ApolloError(emailErr);
            }
            const newUser = await user_schema_1.UserModel.create({
                ...input,
                email: emailInput
            });
            return newUser;
        }
        catch (error) {
            if (error instanceof apollo_server_1.ApolloError) {
                throw error;
            }
            logger_1.logger.error('Error creating user:', error);
            throw new apollo_server_1.ApolloError('An unexpected error occurred while creating the user');
        }
    }
    async createClub(input) {
        const emailErr = `Club with email: ${input.email} already exits`;
        const passwordErr = 'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character (@#$&*-^!).';
        const emailInput = input.email.toLowerCase();
        try {
            if (!validateCheck_1.Validate.isValidPassword(input.password)) {
                throw new apollo_server_1.ApolloError(passwordErr);
            }
            const existingClub = await user_schema_1.UserModel.find().findByEmail(input.email).lean();
            if (existingClub) {
                throw new apollo_server_1.ApolloError(emailErr);
            }
            const newClub = await user_schema_1.UserModel.create({
                ...input,
                email: emailInput,
                role: user_schema_1.UserRole.CLUB
            });
            return newClub;
        }
        catch (error) {
            if (error instanceof apollo_server_1.ApolloError) {
                throw error;
            }
            logger_1.logger.error('Error creating club:', error);
            throw new apollo_server_1.ApolloError('An unexpected error occurred while creating the club');
        }
    }
    async login(input, context) {
        const errorEmail = "Invalid email or password";
        const emailInput = input.email.trim();
        const passwordInput = input.password.trim();
        const user = await user_schema_1.UserModel.findOne({ email: emailInput }).lean();
        if (!user) {
            throw new apollo_server_1.ApolloError(errorEmail);
        }
        const normalizedStoredHash = user.password.startsWith("$2y$")
            ? user.password.replace("$2y$", "$2b$")
            : user.password;
        const passwordIsValid = await bcryptjs_1.default.compare(passwordInput, normalizedStoredHash);
        if (!passwordIsValid) {
            throw new apollo_server_1.ApolloError(errorEmail);
        }
        const isProduction = process.env.NODE_ENV === "production";
        const rememberMeMaxAge = input.rememberMe ? 7 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;
        const trimmedUser = {
            _id: user?._id,
            name: user?.name,
            email: user?.email,
            role: user?.role,
        };
        const token = (0, jwt_1.signJwt)(trimmedUser);
        context.res.cookie("accessToken", token, {
            maxAge: rememberMeMaxAge,
            httpOnly: true,
            path: "/",
            sameSite: isProduction ? "none" : "lax",
            secure: isProduction,
        });
        context.res.cookie("authToken", token, {
            maxAge: rememberMeMaxAge,
            httpOnly: false,
            path: "/",
            sameSite: isProduction ? "none" : "lax",
            secure: isProduction,
        });
        context.res.cookie("userRole", trimmedUser.role, {
            maxAge: rememberMeMaxAge,
            httpOnly: false,
            path: "/",
            sameSite: isProduction ? "none" : "lax",
            secure: isProduction,
        });
        return {
            ...trimmedUser,
            token: token
        };
    }
    async findUserById(input, currentUser) {
        const e = " User with the given Id does not exist";
        let user = await user_schema_1.UserModel.findById(input._id).lean();
        if (!user) {
            return new apollo_server_1.ApolloError(e);
        }
        return user;
    }
    async findClubById(input, currentUser) {
        const e = " Club with the given Id does not exist";
        let club = await user_schema_1.UserModel.findById(input._id).lean();
        if (!club) {
            throw new apollo_server_1.ApolloError(e);
        }
        if (club.role !== user_schema_1.UserRole.CLUB) {
            throw new apollo_server_1.ApolloError("Unauthorized");
        }
        return club;
    }
    async getAllUsers(user) {
        try {
            if (!user) {
                console.log("Unauthenticated user - returning limited user data");
                const users = await user_schema_1.UserModel.find({}, '_id name email role').lean();
                return users.filter(u => u.name != null);
            }
            const isAdmin = user.role === 'ADMIN';
            if (user.role === 'CLUB') {
                const users = await user_schema_1.UserModel.find({}, '_id name email role').lean();
                return users.filter(u => u.name != null);
            }
            if (!isAdmin) {
                throw new apollo_server_1.ApolloError('Unauthorized: Only admin can access full user data');
            }
            const users = await user_schema_1.UserModel.find().lean();
            return users.filter(u => u.name != null);
        }
        catch (error) {
            logger_1.logger.error('Error in getAllUsers:', error);
            if (error instanceof apollo_server_1.ApolloError) {
                throw error;
            }
            throw new apollo_server_1.ApolloError('Failed to fetch users');
        }
    }
    async getAllClubs(user) {
        try {
            console.log("UserService: Returning all clubs - public access");
            const clubs = await user_schema_1.UserModel.find({ role: 'CLUB' })
                .sort({ createdAt: -1 })
                .lean();
            console.log(`UserService: Found ${clubs.length} clubs`);
            return clubs;
        }
        catch (error) {
            console.error("Error in UserService.getAllClubs:", error);
            throw error;
        }
    }
    async updateUserProfile(input, userInformation) {
        const originalUser = await user_schema_1.UserModel.findById(input?.user).lean();
        if (userInformation?.email !== input?.email && input?.email) {
            const userWithEmailExist = await user_schema_1.UserModel.find({
                email: input?.email,
            }).lean();
            if (userWithEmailExist?.length) {
                throw new apollo_server_1.ApolloError(`User with email ${input.email} exist, kindly use another email!`);
            }
        }
        const user = await user_schema_1.UserModel.findOneAndUpdate({ _id: input?.user }, {
            $set: input,
        }, { new: true }).lean();
        try {
            if (originalUser) {
                const clubUpdate = {};
                if (typeof input?.name === "string")
                    clubUpdate["clubName"] = input.name;
                if (typeof input?.email === "string")
                    clubUpdate["email"] = input.email;
                if (Object.keys(clubUpdate).length > 0) {
                    await club_schema_1.ClubModel.findOneAndUpdate({ email: originalUser.email }, { $set: clubUpdate }, { new: true }).lean();
                }
            }
        }
        catch (syncError) {
            logger_1.logger.error("Failed to sync club document with user profile update:", syncError);
        }
        if (user) {
            return user;
        }
        else {
            throw new apollo_server_1.ApolloError("update failed");
        }
    }
    async updateClub(input, userInformation, clubId) {
        const passwordErr = 'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character (@#$&*-^!).';
        if (userInformation.role !== user_schema_1.UserRole.ADMIN) {
            throw new apollo_server_1.ApolloError("UnAuthorized to update this club");
        }
        if (input.password) {
            if (!validateCheck_1.Validate.isValidPassword(input.password)) {
                throw new apollo_server_1.ApolloError(passwordErr);
            }
            const salt = await bcryptjs_1.default.genSalt(10);
            input.password = await bcryptjs_1.default.hash(input.password, salt);
        }
        if (input.email) {
            if (!validateCheck_1.Validate.isValidEmail(input.email)) {
                throw new apollo_server_1.ApolloError('Email is not valid');
            }
        }
        const originalUser = await user_schema_1.UserModel.findById(clubId).lean();
        const user = await user_schema_1.UserModel.findOneAndUpdate({ _id: clubId }, {
            $set: input,
        }, { new: true }).lean();
        try {
            if (originalUser) {
                const clubUpdate = {};
                if (typeof input?.name === "string")
                    clubUpdate["clubName"] = input.name;
                if (typeof input?.email === "string")
                    clubUpdate["email"] = input.email;
                if (typeof input?.password === "string")
                    clubUpdate["password"] = input.password;
                if (Object.keys(clubUpdate).length > 0) {
                    const filter = originalUser.email
                        ? { email: originalUser.email }
                        : { email: user?.email };
                    await club_schema_1.ClubModel.findOneAndUpdate(filter, { $set: clubUpdate }, { new: true }).lean();
                }
            }
        }
        catch (syncError) {
            logger_1.logger.error("Failed to sync club document with admin club update:", syncError);
        }
        if (user) {
            return user;
        }
        else {
            throw new apollo_server_1.ApolloError("update failed");
        }
    }
    async deleteUser(userId, user) {
        const e = " User with the given Id does not exist";
        const initialUser = await user_schema_1.UserModel.findById(userId).lean();
        if (!initialUser) {
            throw new apollo_server_1.ApolloError(e);
        }
        const isAdmin = user.role === 'ADMIN';
        if (!isAdmin) {
            throw new apollo_server_1.ApolloError('Unauthorized: Only admin can delete this user');
        }
        const deletedUser = await user_schema_1.UserModel.findByIdAndDelete(initialUser._id).lean();
        return deletedUser;
    }
    async deleteClub(userId, user) {
        const e = " Club with the given Id does not exist";
        const club = await user_schema_1.UserModel.findById(userId).lean();
        if (!club) {
            throw new apollo_server_1.ApolloError(e);
        }
        const isAdmin = user.role === 'ADMIN';
        if (!isAdmin) {
            throw new apollo_server_1.ApolloError('Unauthorized: Only admin can delete this Club');
        }
        const deletedClub = await user_schema_1.UserModel.findByIdAndDelete(club._id).lean();
        return deletedClub;
    }
    async getAdminUsers() {
        try {
            console.log("Fetching admin users...");
            const admins = await user_schema_1.UserModel.find({ role: user_schema_1.UserRole.ADMIN }).lean();
            console.log("Found admin users:", admins.map(admin => ({
                id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role
            })));
            return admins;
        }
        catch (error) {
            console.error("Error fetching admin users:", error);
            throw new apollo_server_1.ApolloError("Failed to retrieve admin users");
        }
    }
}
exports.default = UserService;
//# sourceMappingURL=user.service.js.map