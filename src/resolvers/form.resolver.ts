import { Arg, Authorized, Ctx, Mutation, Query, Resolver } from "type-graphql";
import Context from "../types/context";
import { ApolloError } from "apollo-server";
import {
  CreateFormInput,
  FindFormByIdInput,
  Form,
  UpdateFormInput,
} from "../schema/form.schema";
import { FormService } from "../service/form.service";
import uploadFile from "../utils/s3Upload";
import _ from "lodash"
import { logger } from "../utils/logger";


@Resolver()
export default class FormResolver {
  constructor(private formService: FormService) {
    this.formService = new FormService();
  }

  @Mutation(() => Form)
  async createForm(
    @Ctx() context: Context,
    @Arg("input") input: CreateFormInput,
  ): Promise<Form> {
    try {
      const { file, formName, formType, fileName } = input;
      const user = context.user!;

      // Only require file for non-musher registration forms
      if (!file && formType !== "new" && formType !== "renewal" && formType !== "change") {
        logger.error("File is required but was not provided");
        throw new ApolloError("File is required for form creation.");
      }

      // Log file information for debugging if file exists
      if (file) {
        logger.info(`Received file for upload. Name: ${fileName || "unnamed"}, Length: ${file.length}`);
        logger.info(`File prefix (first 50 chars): "${file.substring(0, 50)}"`);
      }
      
      // Pass to form service directly - let it handle the upload
      try {
        logger.info(`Creating form in database: ${formName}, type: ${formType}`);
        // Let FormService handle the file upload
        return await this.formService.createForm(input, user);
      } catch (error) {
        logger.error(`Error during form creation: ${error instanceof Error ? error.message : "Unknown error"}`);
        logger.error(`Error details: ${JSON.stringify(error)}`);
        throw new ApolloError(`Error creating form: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    } catch (error) {
      if (error instanceof ApolloError) {
        // Re-throw Apollo errors directly
        logger.error(`Apollo error in createForm: ${error.message}`);
        throw error;
      }
      // Otherwise wrap in a generic error
      logger.error(`Unexpected error in createForm: ${error instanceof Error ? error.message : "Unknown error"}`);
      logger.error(`Error stack: ${error instanceof Error ? error.stack : "No stack available"}`);
      throw new ApolloError("An unexpected error occurred while creating the form. Please try again.");
    }
  }

  @Query(() => [Form], { nullable: true })
  async getAllForms(@Ctx() context: Context) {
    const user = context.user || null; // Treat unauthenticated users as guests
    try {
      return await this.formService.getAllForms(user);
    } catch (error) {
      logger.error(error instanceof Error ? error.message : error);
      throw new ApolloError("Internal server error");
    }
  }

  @Query(() => [Form], { nullable: true })
  async forms(
    @Ctx() context: Context,
    @Arg("formType", { nullable: true }) formType: string,
    @Arg("status", { nullable: true }) status: string,
    @Arg("clubId", { nullable: true }) clubId: string
  ) {
    const user = context.user || null;
    try {
      return await this.formService.getForms(user, formType, status, clubId);
    } catch (error) {
      logger.error(error instanceof Error ? error.message : error);
      throw new ApolloError("Internal server error");
    }
  }

  @Authorized()
  @Query(() => Form, { nullable: true })
  async findFormById(
    @Arg("input") input: FindFormByIdInput,
    @Ctx() context: Context
  ) {
    const user = context.user!;
    const form = await this.formService.findFormById(input, user);

    return form;
  }

  @Authorized()
  @Mutation(() => Form)
  async updateForm(
    @Ctx() context: Context,
    @Arg("formId") formId: String,
    @Arg("input") input: UpdateFormInput,
  ):Promise<Form> {
    try {
      const { file, formName, formType, fileName } = input;
      const user = context.user!;

      // Log information
      logger.info(`Updating form: ${formId}`);
      if (file) {
        logger.info(`Update includes file. File length: ${file.length}`);
        logger.info(`File prefix: ${file.substring(0, 50)}`);
      }
      
      // Let the service handle all the logic
      return await this.formService.updateForm(input, user, formId);
    } catch (error) {
      logger.error(`Error in updateForm: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
      if (error instanceof ApolloError) {
        throw error;
      }
      throw new ApolloError("Internal server error: " + (error instanceof Error ? error.message : "Unknown error"));
    }
  }

  @Authorized()
  @Mutation(() => Form)
  async deleteForm(@Ctx() context: Context, @Arg("formId") formId: String) {
    const user = context.user;
    if (!user) {
      throw new ApolloError("Unauthorized: User is not authenticated");
    }

    return await this.formService.deleteForm(user, formId);
  }

  @Authorized()
  @Mutation(() => Form)
  async approveForm(
    @Ctx() context: Context,
    @Arg("id") id: string
  ): Promise<Form> {
    try {
      const user = context.user;
      if (!user) {
        throw new ApolloError("Unauthorized: User is not authenticated");
      }

      return await this.formService.updateFormStatus(id, "approved", user);
    } catch (error) {
      logger.error(`Error in approveForm: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
      if (error instanceof ApolloError) {
        throw error;
      }
      throw new ApolloError("Error approving form: " + (error instanceof Error ? error.message : "Unknown error"));
    }
  }

  @Authorized()
  @Mutation(() => Form)
  async declineForm(
    @Ctx() context: Context,
    @Arg("id") id: string
  ): Promise<Form> {
    try {
      const user = context.user;
      if (!user) {
        throw new ApolloError("Unauthorized: User is not authenticated");
      }

      return await this.formService.updateFormStatus(id, "declined", user);
    } catch (error) {
      logger.error(`Error in declineForm: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
      if (error instanceof ApolloError) {
        throw error;
      }
      throw new ApolloError("Error declining form: " + (error instanceof Error ? error.message : "Unknown error"));
    }
  }
}
