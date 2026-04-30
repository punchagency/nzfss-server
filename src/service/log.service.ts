import { ApolloError } from "apollo-server";
import { logger } from "../utils/logger";
import { CreateLogInput, FindLogsByIdInput, LogModel } from "../schema/log.schema";

export class LogService {
  async createLog(input: CreateLogInput) {
    try {

      const newLog = await LogModel.create(input);
      return newLog;
    } catch (error) {
      // Catch any error that occurs in the try block and handle it
      if (error instanceof ApolloError) {
        // If the error is already an ApolloError, just throw it
        throw error;
      }

      // If the error is something else (e.g. validation or database error), log and rethrow
      logger.error("Error creating Log:", error);
      throw new ApolloError(
        "An unexpected error occurred while creating the Logs"
      );
    }
  }

  async getAllLogs() {
    try {
      const logs = await LogModel.find().lean();
      return logs;
    } catch (error) {
      logger.error(error instanceof Error ? error.message : error);

      if (error instanceof ApolloError) {
        throw error;
      }

      throw new ApolloError("Internal server error");
    }
  }

  async findLogById(input: FindLogsByIdInput) {
    const error = " log with the given Id does not exist";
    try {
      const log = await LogModel.findById(input._id).lean();
      if (!log) {
        throw new ApolloError(error);
      }
      return log;
    } catch (error) {
      logger.error(error instanceof Error ? error.message : error);

      if (error instanceof ApolloError) {
        throw error;
      }
      throw new ApolloError("Internal sever error ");
    }
  }

  async deleteLog( logId: String) {
    try {
      const deletedLog = await LogModel.findByIdAndDelete(
        logId
      ).lean();

      if (!deletedLog) {
        throw new ApolloError("log with this id not found");
      }

      return deletedLog;
    } catch (error) {
      logger.error(error instanceof Error ? error.message : error);

      if (error instanceof ApolloError) {
        throw error;
      }

      throw new ApolloError("Internal sever error ");
    }
  }

  async findLogsByEntityId(entityId: string) {
    try {
      const logs = await LogModel.find({ entityId }).lean();
      if (!logs.length) {
        throw new ApolloError("No logs found for the given entityId");
      }
      return logs;
    } catch (error) {
      logger.error(error instanceof Error ? error.message : error);
      if (error instanceof ApolloError) {
        throw error;
      }
      throw new ApolloError("Internal server error");
    }
  }


  async logUpdate(userId: string, entity: string, entityId: string, oldData: any, newData: any) {
    const logInput: CreateLogInput = {
      userId,
      action: "update",
      entity,
      entityId,
      oldData: JSON.stringify(oldData),
      newData: JSON.stringify(newData),
    };

    return this.createLog(logInput);
  }
}
