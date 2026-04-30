import { ApolloError } from "apollo-server";
import { isAdmin } from "../utils/helpers";
import { logger } from "../utils/logger";
import { User } from "../schema/user.schema";
import {
  CreateYearbookInput,
  FindYearbookByIdInput,
  UpdateYearbookInput,
  YearbookModel,
} from "../schema/yearbook.schema";

export class YearbookService {
  async createYearbook(input: CreateYearbookInput, user: User) {
    const adminErr = "Only admin can add a yearbook";

    try {
      // Ensure that only admins can create a user
      const adminUser = user!;
      if (!adminUser || !isAdmin(adminUser.role)) {
        throw new ApolloError(adminErr);
      }

      // Create a new Yearbook entrys
      const newYearbook = await YearbookModel.create(input);

      return newYearbook;
    } catch (error) {
      // Catch any error that occurs in the try block and handle it
      if (error instanceof ApolloError) {
        // If the error is already an ApolloError, just throw it
        throw error;
      }

      // If the error is something else (e.g. validation or database error), log and rethrow
      logger.error("Error creating Yearbook:", error);
      throw new ApolloError(
        "An unexpected error occurred while creating the Yearbook"
      );
    }
  }

  async getAllYearbooks(user: User | null) {
    try {
      // Allow all users (including unauthenticated) to access yearbooks
      const yearbooks = await YearbookModel.find()
      .sort({ createdAt: -1 })
      .lean();
      return yearbooks;
    } catch (error) {
      logger.error(error instanceof Error ? error.message : error);

      if (error instanceof ApolloError) {
        throw error;
      }

      throw new ApolloError("Internal server error");
    }
  }

  async findYearbookById(input: FindYearbookByIdInput, user: User | null) {
    const error = "Yearbook with the given Id does not exist";
    
    try {
      // Allow all users (including unauthenticated) to access yearbook details
      const yearbook = await YearbookModel.findById(input._id).lean();
      if (!yearbook) {
        throw new ApolloError(error);
      }
      return yearbook;
    } catch (error) {
      logger.error(error instanceof Error ? error.message : error);

      if (error instanceof ApolloError) {
        throw error;
      }
      throw new ApolloError("Internal sever error ");
    }
  }

  async updateYearbook(
    input: UpdateYearbookInput,
    user: User,
    yearbookId: String
  ) {
    const isAdmin = user.role === "ADMIN";

    try {
      if (!isAdmin) {
        throw new ApolloError(
          "Unauthorized: Only admin can access this resource"
        );
      }

      // Find and update the yearbook
      const yearbook = await YearbookModel.findOneAndUpdate(
        { _id: yearbookId },
        { $set: input },
        { new: true }
      );

      if (!yearbook) {
        throw new ApolloError("Yearbook not found or update failed");
      }

      return yearbook;
    } catch (error) {
      logger.error(error instanceof Error ? error.message : error);

      if (error instanceof ApolloError) {
        throw error;
      }

      throw new ApolloError("Internal server error ");
    }
  }

  async deleteYearbook(user: User, yearbookId: String) {
    try {
      const isAdmin = user.role === "ADMIN";

      if (!user || !isAdmin) {
        return new ApolloError("Unauthorized: Only admin can delete this club");
      }

      const deletedYearbook = await YearbookModel.findByIdAndDelete(
        yearbookId
      ).lean();

      return deletedYearbook;
    } catch (error) {
      logger.error(error instanceof Error ? error.message : error);

      if (error instanceof ApolloError) {
        throw error;
      }

      throw new ApolloError("Internal sever error ");
    }
  }
}
