import { ApolloError } from "apollo-server";
import { logger } from "../../utils/logger";
import UserService from "./user.service";
import { CreateDogInput, DogsModel, FindDogsByIdInput, UpdateDogsInput } from "../dog.schema";

export class DogsService {
  constructor(private userService: UserService) {
    this.userService = new UserService();
  }
  async createDogs(input: CreateDogInput, userId?: string) {
    try {

      const newDog = await DogsModel.create({...input, userId});
      return newDog;
    } catch (error) {
      // Catch any error that occurs in the try block and handle it
      if (error instanceof ApolloError) {
        // If the error is already an ApolloError, just throw it
        throw error;
      }

      // If the error is something else (e.g. validation or database error), log and rethrow
      logger.error("Error creating Dogs:", error);
      throw new ApolloError(
        "An unexpected error occurred while creating the Dogs"
      );
    }
  }

  async getAllDogs() {
    try {
      const dogs = await DogsModel.find().lean();
      return dogs;
    } catch (error) {
      logger.error(error instanceof Error ? error.message : error);

      if (error instanceof ApolloError) {
        throw error;
      }
 
      throw new ApolloError("Internal server error");
    }
  }

  async findDogsById(input: FindDogsByIdInput) {
    const error = " Dogs with the given Id does not exist";
    try {
      const dog = await DogsModel.findById(input._id).lean();
      if (!dog) {
        throw new ApolloError(error);
      }
      return dog;
    } catch (error) {
      logger.error(error instanceof Error ? error.message : error);

      if (error instanceof ApolloError) {
        throw error;
      }
      throw new ApolloError("Internal sever error ");
    }
  }

  async updateDogs(
    input: UpdateDogsInput,
    dogId: String
  ) {
    try {
      // Find and update the Dogs
      const dog = await DogsModel.findOneAndUpdate(
        { _id: dogId },
        { $set: input },
        { new: true }
      );

      if (!dog) {
        throw new ApolloError("Dogs not found or update failed");
      }

      return dog;
    } catch (error) {
      logger.error(error instanceof Error ? error.message : error);

      if (error instanceof ApolloError) {
        throw error;
      }

      throw new ApolloError("Internal sever error ");
    }
  }

  async deleteDogs( dogId: String) {
    try {
      const deletedDogs = await DogsModel.findByIdAndDelete(
        dogId
      ).lean();

      if (!deletedDogs) {
        throw new ApolloError("Dogs with this id not found");
      }

      return deletedDogs;
    } catch (error) {
      logger.error(error instanceof Error ? error.message : error);

      if (error instanceof ApolloError) {
        throw error;
      }

      throw new ApolloError("Internal sever error ");
    }
  }
}
