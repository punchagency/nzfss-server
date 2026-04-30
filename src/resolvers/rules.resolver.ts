import { Arg, Authorized, Ctx, Mutation, Query, Resolver } from "type-graphql";
import Context from "../types/context";
import { GraphQLUpload } from "graphql-upload";
import Upload from "../types/upload";
import { ApolloError } from "apollo-server";
import {
  CreateRulesInput,
  FindRulesByIdInput,
  Rules,
  UpdateRulesInput,
} from "../schema/rules.schema";
import { RulesService } from "../service/rules.service";
import { logger } from "../utils/logger";
import uploadFile from "../utils/s3Upload";
import _ from "lodash";
//.
@Resolver()
export default class RulesResolver {
  constructor(private rulesService: RulesService) {
    this.rulesService = new RulesService();
  }

  @Authorized()
  @Mutation(() => Rules)
  async createRules(
    @Ctx() context: Context,
    @Arg("input") input: CreateRulesInput
  ) {
    try {
      const { file, amendedDate, constitutionRules, fileName } = input;
      const user = context.user!;

      // If the file is provided, we assume the file is a base64-encoded string
      const uploadedFileUrl = await uploadFile(
        file,
        user._id,
        "uploads/rules/"
      );
      if (!uploadedFileUrl) {
        throw new ApolloError("Error uploading the file.");
      }

      const formData = {
        amendedDate,
        constitutionRules,
        file: uploadedFileUrl as string,
        fileName,
      };

      return await this.rulesService.createRules(formData, user);
    } catch (error) {
      throw new ApolloError("An Unexpected Error Occurred");
    }
  }

  @Query(() => [Rules], { nullable: true })
  async getAllRules(@Ctx() context: Context) {
    const user = context.user || null;
    try {
      return await this.rulesService.getAllRules(user);
    } catch (error) {
      logger.error(error instanceof Error ? error.message : error);
      throw new ApolloError("Internal server error");
    }
  }

  @Authorized()
  @Query(() => Rules, { nullable: true })
  async findRulesById(
    @Arg("input") input: FindRulesByIdInput,
    @Ctx() context: Context
  ) {
    const user = context.user!;
    const rule = await this.rulesService.findRulesById(input, user);

    return rule;
  }

  @Authorized()
  @Mutation(() => Rules)
  async updateRules(
    @Ctx() context: Context,
    @Arg("input") input: UpdateRulesInput,
    @Arg("rulesId") rulesId: String,
  ) {
    try {
      const { file, amendedDate, constitutionRules, fileName } = input;

      const updateData = _.pickBy(
        {
          file,
          amendedDate,
          constitutionRules,
          fileName,
        },
        (value) => value != null
      );

      // Check if no valid fields are provided (i.e., the object is empty)
      if (Object.keys(updateData).length === 0) {
        throw new ApolloError("Please provide at least one field to update");
      }

      const user = context.user!;

      let uploadedFileUrl = null;

      if ( file) {
        // If the file is provided, we assume the file is a base64-encoded string
        uploadedFileUrl = await uploadFile(
          file as string,
          user._id,
          "uploads/rules/"
        );
        if (!uploadedFileUrl) {
          throw new ApolloError("Error uploading the file.");
        }
      }

      const formData = {
        ...updateData,
        file: uploadedFileUrl ? uploadedFileUrl : updateData.file,
      };

      return await this.rulesService.updateRules(formData, user, rulesId);
    } catch (error) {
      throw new ApolloError("Internal server error: " + error);
    }
  }

  @Authorized()
  @Mutation(() => Rules)
  async deleteRules(@Ctx() context: Context, @Arg("rulesId") rulesId: String) {
    const user = context.user;
    if (!user) {
      throw new ApolloError("Unauthorized: User is not authenticated");
    }

    try {
      return await this.rulesService.deleteRule(user, rulesId);
    } catch (error) {
      throw new ApolloError(`${error}`);
    }
  }
}
