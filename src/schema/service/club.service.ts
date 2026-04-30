import { ApolloError } from "apollo-server";
import {
  ClubModel,
  CreateClubInput,
  FindClubByIdInput,
  UpdateClubInput,
} from "../club.schema";
import Context from "../../types/context";
import { isAdmin } from "../../utils/helpers";
import { logger } from "../../utils/logger";
import { User } from "../user.schema";
import UserService from "./user.service";
import { Validate } from "../../utils/validateCheck";

export class ClubService {
  constructor(private userService: UserService) {
    this.userService = new UserService();
  }
  async createClub(input: CreateClubInput, context: Context) {
    const adminErr = "Only admin can add a club";
    const passwordErr =
      "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character (@#$&*-^!).";

    try {
      // Validate the password using the utility sfunction
      if (!Validate.isValidPassword(input.password)) {
        throw new ApolloError(passwordErr);
      }

      const adminUser = context.user!;
      if (!adminUser || !isAdmin(adminUser.role)) {
        throw new ApolloError(adminErr);
      }

      const newClub = await ClubModel.create(input);
      return newClub;
    } catch (error) {
      // Catch any error that occurs in the try block and handle it
      if (error instanceof ApolloError) {
        // If the error is already an ApolloError, just throw it
        throw error;
      }

      // If the error is something else (e.g. validation or database error), log and rethrow
      logger.error("Error creating club:", error);
      throw new ApolloError(
        "An unexpected error occurred while creating the club"
      );
    }
  }

  async getAllClubs(user: User) {
    // Check if the user's role is 'admin'
    const isAdmin = user.role === "ADMIN";

    try {
      if (!isAdmin) {
        throw new Error("Unauthorized: Only admin can access this resource");
      }

      const clubs = await ClubModel.find().lean();
      return clubs;
    } catch (error) {
      logger.error(error instanceof Error ? error.message : error);

      if (error instanceof ApolloError) {
        throw error;
      }

      throw new ApolloError("Internal server error");
    }
  }

  async findClubById(input: FindClubByIdInput, user: User) {
    const error = " Club with the given Id does not exist";
    const isAdmin = user.role === "ADMIN";
    try {
      if (!user || !isAdmin) {
        throw new ApolloError(
          "Unauthorized: Only admin can access this resource"
        );
      }

      const club = await ClubModel.findById(input._id).lean();
      if (!club) {
        throw new ApolloError(error);
      }
      return club;
    } catch (error) {
      logger.error(error instanceof Error ? error.message : error);

      if (error instanceof ApolloError) {
        throw error;
      }
      throw new ApolloError("Internal sever error ");
    }
  }

  async updateClub(input: UpdateClubInput, user: User, clubId: String) {
    const passwordErr =
      "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character (@#$&*-^!).";
    const isAdmin = user.role === "ADMIN";

    try {
      if (!isAdmin) {
        throw new ApolloError(
          "Unauthorized: Only admin can access this resource"
        );
      }

      // Check password confirmation
      if (
        input.password &&
        input.confirmPassword &&
        input.password !== input.confirmPassword
      ) {
        throw new ApolloError("Password and confirm password must match");
      }

      if (!Validate.isValidPassword(input.password)) {
        throw new ApolloError(passwordErr);
      }

      // Find and update the club
      const club = await ClubModel.findOneAndUpdate(
        { _id: clubId },
        { $set: input },
        { new: true }
      );

      if (!club) {
        throw new ApolloError("Club not found or update failed");
      }

      return club;
    } catch (error) {
      logger.error(error instanceof Error ? error.message : error);

      if (error instanceof ApolloError) {
        throw error;
      }

      throw new ApolloError("Internal sever error ");
    }
  }

  async deleteClub(user: User, clubId: String) {
    try {
      const isAdmin = user.role === "ADMIN";

      if (!user || !isAdmin) {
        throw new ApolloError("Unauthorized: Only admin can delete this club");
      }

      const deletedClub = await ClubModel.findByIdAndDelete(clubId).lean();

      if(!deletedClub){
        throw new ApolloError("Club with this id not found");
      }

      return deletedClub;
    } catch (error) {
      logger.error(error instanceof Error ? error.message : error);

      if (error instanceof ApolloError) {
        throw error;
      }

      throw new ApolloError("Internal sever error ");
    }
  }
}
