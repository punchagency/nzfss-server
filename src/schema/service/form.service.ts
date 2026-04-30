import { ApolloError } from "apollo-server-express";
import { isAdmin } from "../../utils/helpers";
import { logger } from "../../utils/logger";
import { User } from "../user.schema";
import { CreateFormInput, FindFormByIdInput, Form, FormModel, UpdateFormInput } from "../form.schema";

export class FormService {

  async createForm(input: CreateFormInput, user: User):Promise<Form>{
    const adminErr = "Only admin can add a Form";
    
    try {
     
      // Ensure that only admins can create a sform
      const adminUser = user!;
      if (!adminUser || !isAdmin(adminUser.role)) {
        throw new ApolloError(adminErr);
      }

       // Create a new form entry
       const newForm = await FormModel.create({
         formName: input.formName, 
         formType: input.formType,
         file: input.file,
         fileName: input.fileName
      });

      return newForm;

    } catch (error) {
      // Catch any error that occurs in the try block and handle it
      if (error instanceof ApolloError) {
        // If the error is already an ApolloError, just throw it
        throw error;
      }

      // If the error is something else (e.g. validation or database error), log and rethrow
      logger.error("Error creating form:", error);
      throw new ApolloError(
        "An unexpected error occurred while creating the form"
      );
    }
  }

  async getAllForms(user: User) {
    // Check if the user's role is 'admin'
    const isAdmin = user.role === "ADMIN";

    try {
      if (!isAdmin) {
        throw new Error("Unauthorized: Only admin can access this resource");
      }

      const yearbooks = await FormModel.find().lean();
      return yearbooks;
    } catch (error) {
      logger.error(error instanceof Error ? error.message : error);

      if (error instanceof ApolloError) {
        throw error;
      }

      throw new ApolloError("Internal server error");
    }
  }

  async findFormById(input: FindFormByIdInput, user: User) {
    const error = " Form with the given Id does not exist";
    const isAdmin = user.role === "ADMIN";
    try {
      if (!user || !isAdmin) {
        throw new ApolloError(
          "Unauthorized: Only admin can access this resource"
        );
      }

      const form = await FormModel.findById(input.formId).lean();
      if (!form) {
        throw new ApolloError(error);
      }
      return form;
    } catch (error) {
      logger.error(error instanceof Error ? error.message : error);

      if (error instanceof ApolloError) {
        throw error;
      }
      throw new ApolloError("Internal sever error ");
    }
  }

  async updateForm(input: UpdateFormInput, user: User, formId: String) {
       const isAdmin = user.role === "ADMIN";

    try {
      if (!isAdmin) {
        throw new ApolloError(
          "Unauthorized: Only admin can access this resource"
        );
      }

      // Find and update the yearbook
      const form = await FormModel.findOneAndUpdate(
        { _id: formId },
        { $set: input },
        { new: true }
      );

      if (!form) {
        throw new ApolloError("Form not found or update failed");
      }

      return form;
    } catch (error) {
      logger.error(error instanceof Error ? error.message : error);

      if (error instanceof ApolloError) {
        throw error;
      }

      throw new ApolloError("Internal server error ");
    }
  }

  async deleteForm(user: User, formId: String) {
    try {
      const isAdmin = user.role === "ADMIN";

      if (!user || !isAdmin) {
        return new ApolloError("Unauthorized: Only admin can delete this club");
      }

      const deletedForm = await FormModel.findByIdAndDelete(formId).lean();

      return deletedForm;
    } catch (error) {
      logger.error(error instanceof Error ? error.message : error);

      if (error instanceof ApolloError) {
        throw error;
      }

      throw new ApolloError("Internal sever error ");
    }
  }
}
