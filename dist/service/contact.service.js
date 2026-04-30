"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactService = void 0;
const contact_schema_1 = require("../schema/contact.schema");
const typegoose_1 = require("@typegoose/typegoose");
const graphql_1 = require("graphql");
const mongoose_1 = __importDefault(require("mongoose"));
const ContactModel = (0, typegoose_1.getModelForClass)(contact_schema_1.Contact);
class ContactService {
    async createContact(input) {
        try {
            console.log("ContactService.createContact - Input received:", {
                name: input.name,
                designation: input.designation,
                email: input.email,
                clubId: input.clubId,
                hasImage: !!input.image
            });
            if (!mongoose_1.default.Types.ObjectId.isValid(input.clubId)) {
                throw new graphql_1.GraphQLError(`Invalid clubId format: ${input.clubId}`);
            }
            const contactData = {
                name: input.name,
                designation: input.designation,
                email: input.email,
                image: input.image,
                club: input.clubId,
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
        }
        catch (error) {
            console.error("ContactService.createContact - Error details:", {
                message: error.message,
                name: error.name,
                stack: error.stack,
                errors: error.errors
            });
            throw new graphql_1.GraphQLError(`Error creating contact: ${error.message}`);
        }
    }
    async getAllContacts() {
        try {
            const contacts = await ContactModel.find().exec();
            return contacts.sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
        }
        catch (error) {
            throw new graphql_1.GraphQLError(`Error fetching contacts: ${error.message}`);
        }
    }
    async findContactById(contactId) {
        try {
            const contact = await ContactModel.findById(contactId).exec();
            if (!contact) {
                throw new graphql_1.GraphQLError("Contact not found");
            }
            return contact;
        }
        catch (error) {
            throw new graphql_1.GraphQLError(`Error finding contact: ${error.message}`);
        }
    }
    async updateContact(contactId, input) {
        try {
            const contact = await ContactModel.findByIdAndUpdate(contactId, { $set: input }, { new: true }).exec();
            if (!contact) {
                throw new graphql_1.GraphQLError("Contact not found");
            }
            return contact;
        }
        catch (error) {
            throw new graphql_1.GraphQLError(`Error updating contact: ${error.message}`);
        }
    }
    async deleteContact(contactId) {
        try {
            const contact = await ContactModel.findByIdAndDelete(contactId).exec();
            if (!contact) {
                throw new graphql_1.GraphQLError("Contact not found");
            }
            return contact;
        }
        catch (error) {
            throw new graphql_1.GraphQLError(`Error deleting contact: ${error.message}`);
        }
    }
}
exports.ContactService = ContactService;
//# sourceMappingURL=contact.service.js.map