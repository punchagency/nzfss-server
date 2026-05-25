"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const apollo_server_1 = require("apollo-server");
const user_schema_1 = require("../user.schema");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jwt_1 = require("../../utils/jwt");
const validateCheck_1 = require("../../utils/validateCheck");
const logger_1 = require("../../utils/logger");
class UserService {
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
        const emailInput = input.email.toLowerCase();
        console.log(emailInput, "emailInput");
        const user = await user_schema_1.UserModel.findOne({ email: emailInput }).lean();
        if (!user) {
            throw new apollo_server_1.ApolloError(errorEmail);
        }
        const passwordIsValid = await bcryptjs_1.default.compare(input.password, user.password);
        if (!passwordIsValid) {
            throw new apollo_server_1.ApolloError(errorEmail);
        }
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
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            secure: process.env.NODE_ENV === "production",
        });
        return {
            ...trimmedUser,
            token: token
        };
    }
    async findUserById(input, currentUser) {
        const e = " User with the given Id does not exist";
        const isAdmin = currentUser.role;
        if (!isAdmin) {
            throw new apollo_server_1.ApolloError('Unauthorized');
        }
        let user = await user_schema_1.UserModel.findById(input._id).lean();
        if (!user) {
            return new apollo_server_1.ApolloError(e);
        }
        return user;
    }
    async findClubById(input, currentUser) {
        const e = " Club with the given Id does not exist";
        const isAdmin = currentUser.role;
        if (!isAdmin) {
            throw new apollo_server_1.ApolloError('Unauthorized');
        }
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
        const isAdmin = user.role === 'ADMIN';
        if (!isAdmin) {
            throw new Error('Unauthorized: Only admin can access this resource');
        }
        const users = await user_schema_1.UserModel.find().lean();
        return users;
    }
    async getAllClubs(user) {
        const isAdmin = user.role === 'ADMIN';
        if (!isAdmin) {
            throw new Error('Unauthorized: Only admin can access this resource');
        }
        const clubs = await user_schema_1.UserModel.find({ role: 'CLUB' })
            .sort({ createdAt: -1 })
            .lean();
        return clubs;
    }
    async updateUserProfile(input, userInformation) {
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
        if (input.password && input.newPassword) {
            if (!validateCheck_1.Validate.isValidPassword(input.newPassword)) {
                throw new apollo_server_1.ApolloError(passwordErr);
            }
            const club = await user_schema_1.UserModel.findById(clubId).lean();
            if (!club) {
                throw new apollo_server_1.ApolloError("Club not found");
            }
            const isPasswordValid = await bcryptjs_1.default.compare(input.password, club.password);
            if (!isPasswordValid) {
                throw new apollo_server_1.ApolloError("Current password is not incorrect");
            }
            const hashedNewPassword = await bcryptjs_1.default.hash(input.newPassword, 10);
            input.password = hashedNewPassword;
        }
        if (input.email) {
            if (!validateCheck_1.Validate.isValidEmail(input.email)) {
                throw new apollo_server_1.ApolloError('Email is not valid');
            }
        }
        const user = await user_schema_1.UserModel.findOneAndUpdate({ _id: clubId }, {
            $set: input,
        }, { new: true }).lean();
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
}
exports.default = UserService;
//# sourceMappingURL=user.service.js.map