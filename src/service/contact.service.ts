import { Contact } from "../schema/contact.schema";
import { getModelForClass } from "@typegoose/typegoose";
import { GraphQLError } from "graphql";
import { CreateContactInput, UpdateContactInput } from "../schema/contact.schema";
import { User } from "../schema/user.schema";
import mongoose from "mongoose";

const ContactModel = getModelForClass(Contact);

export class ContactService {
  async createContact(input: CreateContactInput) {
    try {
      console.log("ContactService.createContact - Input received:", {
        name: input.name,
        designation: input.designation,
        email: input.email,
        clubId: input.clubId,
        hasImage: !!input.image
      });

      // Validate clubId is a valid ObjectId
      if (!mongoose.Types.ObjectId.isValid(input.clubId)) {
        throw new GraphQLError(`Invalid clubId format: ${input.clubId}`);
      }

      const contactData = {
        name: input.name,
        designation: input.designation,
        email: input.email,
        image: input.image,
        club: input.clubId, // Map clubId to club field
        created_at: new Date()
      };

      console.log("ContactService.createContact - Data to save:", contactData);

      const contact = await ContactModel.create(contactData);
      
      console.log("ContactService.createContact - Contact created successfully:", {
        contactId: contact._id,
        clubId: contact.club,
        contactName: contact.name
      });

      return contact;
    } catch (error: any) {
      console.error("ContactService.createContact - Error details:", {
        message: error.message,
        name: error.name,
        stack: error.stack,
        errors: error.errors
      });
      throw new GraphQLError(`Error creating contact: ${error.message}`);
    }
  }

  async getAllContacts() {
    try {
      const contacts = await ContactModel.find().exec();
      return contacts.sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
    } catch (error: any) {
      throw new GraphQLError(`Error fetching contacts: ${error.message}`);
    }
  }

  async findContactById(contactId: string) {
    try {
      const contact = await ContactModel.findById(contactId).exec();
      if (!contact) {
        throw new GraphQLError("Contact not found");
      }
      return contact;
    } catch (error: any) {
      throw new GraphQLError(`Error finding contact: ${error.message}`);
    }
  }

  async updateContact(contactId: string, input: UpdateContactInput) {
    try {
      const contact = await ContactModel.findByIdAndUpdate(
        contactId,
        { $set: input },
        { new: true }
      ).exec();
      if (!contact) {
        throw new GraphQLError("Contact not found");
      }
      return contact;
    } catch (error: any) {
      throw new GraphQLError(`Error updating contact: ${error.message}`);
    }
  }

  async deleteContact(contactId: string) {
    try {
      const contact = await ContactModel.findByIdAndDelete(contactId).exec();
      if (!contact) {
        throw new GraphQLError("Contact not found");
      }
      return contact;
    } catch (error: any) {
      throw new GraphQLError(`Error deleting contact: ${error.message}`);
    }
  }
} 