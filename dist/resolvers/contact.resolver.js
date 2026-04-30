"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const type_graphql_1 = require("type-graphql");
const contact_schema_1 = require("../schema/contact.schema");
const contact_service_1 = require("../service/contact.service");
const graphql_1 = require("graphql");
let ContactResolver = class ContactResolver {
    constructor(contactService) {
        this.contactService = contactService;
        this.contactService = new contact_service_1.ContactService();
    }
    async getAllContacts(context) {
        try {
            const contacts = await this.contactService.getAllContacts();
            console.log("Public access: fetching all contacts");
            console.log("Found contacts:", { total: contacts.length });
            return contacts;
        }
        catch (error) {
            console.error("Error fetching contacts:", error);
            throw new graphql_1.GraphQLError("Failed to fetch contacts");
        }
    }
    async createContact(context, input) {
        const user = context.user;
        if (!user) {
            throw new graphql_1.GraphQLError("Not authenticated");
        }
        console.log("Creating contact with user context:", {
            userId: user._id,
            userRole: user.role,
            userName: user.name
        });
        console.log("Contact input:", {
            name: input.name,
            designation: input.designation,
            email: input.email,
            clubId: input.clubId
        });
        try {
            const contact = await this.contactService.createContact(input);
            console.log("Created contact:", {
                contactId: contact._id,
                clubId: contact.club,
                contactName: contact.name
            });
            return contact;
        }
        catch (error) {
            console.error("Error creating contact:", error);
            throw new graphql_1.GraphQLError("Failed to create contact");
        }
    }
    async findContactById(input, context) {
        const contact = await this.contactService.findContactById(input.contactId);
        return contact;
    }
    async updateContact(context, contactId, input) {
        const user = context.user;
        if (!user) {
            throw new graphql_1.GraphQLError("Unauthorized: User is not authenticated");
        }
        return await this.contactService.updateContact(contactId, input);
    }
    async deleteContact(context, contactId) {
        const user = context.user;
        if (!user) {
            throw new graphql_1.GraphQLError("Unauthorized: User is not authenticated");
        }
        return await this.contactService.deleteContact(contactId);
    }
};
__decorate([
    (0, type_graphql_1.Query)(() => [contact_schema_1.Contact]),
    __param(0, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ContactResolver.prototype, "getAllContacts", null);
__decorate([
    (0, type_graphql_1.Authorized)(),
    (0, type_graphql_1.Mutation)(() => contact_schema_1.Contact),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("input")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, contact_schema_1.CreateContactInput]),
    __metadata("design:returntype", Promise)
], ContactResolver.prototype, "createContact", null);
__decorate([
    (0, type_graphql_1.Authorized)(),
    (0, type_graphql_1.Query)(() => contact_schema_1.Contact, { nullable: true }),
    __param(0, (0, type_graphql_1.Arg)("input")),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [contact_schema_1.FindContactByIdInput, Object]),
    __metadata("design:returntype", Promise)
], ContactResolver.prototype, "findContactById", null);
__decorate([
    (0, type_graphql_1.Authorized)(),
    (0, type_graphql_1.Mutation)(() => contact_schema_1.Contact),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("contactId")),
    __param(2, (0, type_graphql_1.Arg)("input")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, contact_schema_1.UpdateContactInput]),
    __metadata("design:returntype", Promise)
], ContactResolver.prototype, "updateContact", null);
__decorate([
    (0, type_graphql_1.Authorized)(),
    (0, type_graphql_1.Mutation)(() => contact_schema_1.Contact),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("contactId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ContactResolver.prototype, "deleteContact", null);
ContactResolver = __decorate([
    (0, type_graphql_1.Resolver)(),
    __metadata("design:paramtypes", [contact_service_1.ContactService])
], ContactResolver);
exports.default = ContactResolver;
//# sourceMappingURL=contact.resolver.js.map