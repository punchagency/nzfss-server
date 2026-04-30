import { ApolloError } from "apollo-server";
import {
  ClubModel,
  CreateClubInput,
  FindClubByIdInput,
  UpdateClubInput,
} from "../schema/club.schema";
import Context from "../types/context";
import { isAdmin } from "../utils/helpers";
import { logger } from "../utils/logger";
import { User } from "../schema/user.schema";
import UserService from "./user.service";
import { Validate } from "../utils/validateCheck";
import bcrypt from 'bcryptjs';
import { EventCalendarModel } from "../schema/calendar.schema";

export class ClubService {
  constructor(private userService: UserService) {
    this.userService = new UserService();
  }
  async createClub(input: CreateClubInput, context: Context) {
    const adminErr = "Only admin can add a club";
    const passwordErr =
      "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character (@#$&*-^!).";

    try {
      // Validate the password using the utility function
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

  async getAllClubs(user: User | undefined) {
    // Allow access to all users (authenticated or not)
    
    try {
      console.log("ClubService: Fetching all clubs - public access");
      const clubs = await ClubModel.find().lean();
      console.log(`ClubService: Found ${clubs.length} clubs`);
      return clubs;
    } catch (error) {
      logger.error(error instanceof Error ? error.message : error);

      if (error instanceof ApolloError) {
        throw error;
      }

      throw new ApolloError("Internal server error");
    }
  }

  async findClubById(input: FindClubByIdInput, user?: User) {
    const error = " Club with the given Id does not exist";
    try {
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

      if (input.password && !Validate.isValidPassword(input.password)) {
        throw new ApolloError(passwordErr);
      }

      // Find the club first
      const club = await ClubModel.findById(clubId);
      
      if (!club) {
        throw new ApolloError("Club not found");
      }

      // Update the club's properties
      if (input.clubName) {
        club.clubName = input.clubName;
      }
      if (input.email) {
        club.email = input.email;
      }
      if (input.password) {
        club.password = input.password;
      }

      // Save the club to trigger the pre-save middleware
      const updatedClub = await club.save();

      return updatedClub;
    } catch (error) {
      logger.error(error instanceof Error ? error.message : error);

      if (error instanceof ApolloError) {
        throw error;
      }

      throw new ApolloError("Internal server error");
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

      // Delete all events associated with this club
      await EventCalendarModel.deleteMany({ clubId: clubId });

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
