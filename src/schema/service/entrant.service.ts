import { ApolloError } from "apollo-server";
import { logger } from "../../utils/logger";
import {
  CreateEntrantInput,
  EntrantModel,
  FindEntrantByIdInput,
  UpdateEntrantInput,
} from "../entrants.schema";
import { LogService } from "./log.service";

export class EntrantService {
  constructor(private logService: LogService) {
    this.logService = new LogService();
  }
  async createEntrant(input: CreateEntrantInput, userId?: string) {
    try {

      const newEntrant = await EntrantModel.create({...input, userId});
      return newEntrant;
    } catch (error) {
      // Catch any error that occurs in the try block and handle it
      if (error instanceof ApolloError) {
        // If the error is already an ApolloError, just throw it
        throw error;
      }

      // If the error is something else (e.g. validation or database error), log and rethrow
      logger.error("Error creating entrant:", error);
      throw new ApolloError(
        "An unexpected error occurred while creating the entrant"
      );
    }
  }

  async getAllEntrants() {
    try {
      const Entrants = await EntrantModel.find().lean();
      return Entrants;
    } catch (error) {
      logger.error(error instanceof Error ? error.message : error);

      if (error instanceof ApolloError) {
        throw error;
      }

      throw new ApolloError("Internal server error");
    }
  }

  async findEntrantById(input: FindEntrantByIdInput) {
    const error = " Entrant with the given Id does not exist";
    try {
      const entrant = await EntrantModel.findById(input._id).lean();
      if (!entrant) {
        throw new ApolloError(error);
      }
      return entrant;
    } catch (error) {
      logger.error(error instanceof Error ? error.message : error);

      if (error instanceof ApolloError) {
        throw error;
      }
      throw new ApolloError("Internal sever error ");
    }
  }

  async updateEntrant(
    input: UpdateEntrantInput,
    entrantId: string,
    userId: string
  ) {
    try {
      const oldEntrant = await EntrantModel.findById(entrantId).lean();
      if (!oldEntrant) {
        throw new ApolloError("Result not found");
      }

      const updatedEntrant = await EntrantModel.findByIdAndUpdate(entrantId, input, { new: true }).lean();

      if (!updatedEntrant) {
        throw new ApolloError("Error updating entrant");
      }

      const changes = this.getChanges(oldEntrant, updatedEntrant);

      await this.logService.logUpdate(userId, "result", entrantId, changes.oldData, changes.newData);

      return updatedEntrant;

    } catch (error) {
      logger.error(error instanceof Error ? error.message : error);

      if (error instanceof ApolloError) {
        throw error;
      }

      throw new ApolloError("Internal sever error ");
    }
  }

  async deleteEntrant( entrantId: string) {
    try {
      const deletedEntrant = await EntrantModel.findByIdAndDelete(
        entrantId
      ).lean();

      if (!deletedEntrant) {
        throw new ApolloError("Entrant with this id not found");
      }

      return deletedEntrant;
    } catch (error) {
      logger.error(error instanceof Error ? error.message : error);

      if (error instanceof ApolloError) {
        throw error;
      }

      throw new ApolloError("Internal sever error ");
    }
  }

  private getChanges(oldData: any, newData: any) {
    const changes: any = {
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
