import { ApolloError } from "apollo-server";
import { isAdmin } from "../../utils/helpers";
import { logger } from "../../utils/logger";
import { User } from "../user.schema";
import { CreateRulesInput, FindRulesByIdInput, RulesModel, UpdateRulesInput } from "../rules.schema";

export class RulesService {

  async createRules(input: CreateRulesInput, user: User) {
    const adminErr = "Only admin can add a rules";
    
    try {
     
      // Ensure that only admins can create a rules
      const adminUser = user!;
      if (!adminUser || !isAdmin(adminUser.role)) {
        throw new ApolloError(adminErr);
      }

     
       // Create a new rules entry
       const newRules = await RulesModel.create({
         constitutionRules: input.constitutionRules, 
         amendedDate: input.amendedDate,
         file: input.file,
         fileName: input?.fileName
      });

      return newRules;

    } catch (error) {
      // Catch any error that occurs in the try block and handle it
      if (error instanceof ApolloError) {
        // If the error is already an ApolloError, just throw it
        throw error;
      }

      // If the error is something else (e.g. validation or database error), log and rethrow
      logger.error("Error creating rules:", error);
      throw new ApolloError(
        "An unexpected error occurred while creating the rules"
      );
    }
  }

  async getAllRules(user: User) {
    // Check if the user's role is 'admin'
    const isAdmin = user.role === "ADMIN";

    try {
      if (!isAdmin) {
        throw new Error("Unauthorized: Only admin can access this resource");
      }

      const rules = await RulesModel.find().lean();
      return rules;
    } catch (error) {
      logger.error(error instanceof Error ? error.message : error);

      if (error instanceof ApolloError) {
        throw error;
      }

      throw new ApolloError("Internal server error");
    }
  }

  async findRulesById(input: FindRulesByIdInput, user: User) {
    const error = " Rules with the given Id does not exist";
    const isAdmin = user.role === "ADMIN";
    try {
      if (!user || !isAdmin) {
        throw new ApolloError(
          "Unauthorized: Only admin can access this resource"
        );
      }

      const rules = await RulesModel.findById(input._id).lean();
      if (!rules) {
        throw new ApolloError(error);
      }
      return rules;
    } catch (error) {
      logger.error(error instanceof Error ? error.message : error);

      if (error instanceof ApolloError) {
        throw error;
      }
      throw new ApolloError("Internal sever error ");
    }
  }

  async updateRules(input: UpdateRulesInput, user: User, rulesId: String) {
       const isAdmin = user.role === "ADMIN";

    try {
      if (!isAdmin) {
        throw new ApolloError(
          "Unauthorized: Only admin can access this resource"
        );
      }

      // Find and update the rules
      const rules = await RulesModel.findOneAndUpdate(
        { _id: rulesId },
        { $set: input },
        { new: true }
      );

      if (!rules) {
        throw new ApolloError("Rules not found or update failed");
      }

      return rules;
    } catch (error) {
      logger.error(error instanceof Error ? error.message : error);

      if (error instanceof ApolloError) {
        throw error;
      }

      throw new ApolloError("Internal server error ");
    }
  }

  async deleteRule(user: User, rulesId: String) {
    try {
      const isAdmin = user.role === "ADMIN";

      if (!user || !isAdmin) {
        return new ApolloError("Unauthorized: Only admin can delete this club");
      }

      const deletedRule = await RulesModel.findByIdAndDelete(rulesId).lean();

      if(!deletedRule){
          throw new ApolloError("Role with this id not found")
      }

      return deletedRule;
    } catch (error) {
      logger.error(error instanceof Error ? error.message : error);

      if (error instanceof ApolloError) {
        throw error;
      }

      throw new ApolloError("Internal sever error ");
    }
  }
}
