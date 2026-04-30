import { Resolver, Query, Mutation, Arg, Ctx, Authorized } from "type-graphql";
import { Contact, CreateContactInput, UpdateContactInput, FindContactByIdInput } from "../schema/contact.schema";
import { ContactService } from "../service/contact.service";
import { Context } from "../types/context";
import { GraphQLError } from "graphql";

@Resolver()
export default class ContactResolver {
  constructor(private contactService: ContactService) {
    this.contactService = new ContactService();
  }

  @Query(() => [Contact])
  async getAllContacts(@Ctx() context: Context) {
    try {
      const contacts = await this.contactService.getAllContacts();
      console.log("Public access: fetching all contacts");
      console.log("Found contacts:", { total: contacts.length });
      return contacts;
    } catch (error) {
      console.error("Error fetching contacts:", error);
      throw new GraphQLError("Failed to fetch contacts");
    }
  }

  @Authorized()
  @Mutation(() => Contact)
  async createContact(
    @Ctx() context: Context,
    @Arg("input") input: CreateContactInput
  ) {
    const user = context.user;
    if (!user) {
      throw new GraphQLError("Not authenticated");
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
    } catch (error) {
      console.error("Error creating contact:", error);
      throw new GraphQLError("Failed to create contact");
    }
  }

  @Authorized()
  @Query(() => Contact, { nullable: true })
  async findContactById(
    @Arg("input") input: FindContactByIdInput,
    @Ctx() context: Context
  ) {
    const contact = await this.contactService.findContactById(input.contactId);
    return contact;
  }

  @Authorized()
  @Mutation(() => Contact)
  async updateContact(
    @Ctx() context: Context,
    @Arg("contactId") contactId: string,
    @Arg("input") input: UpdateContactInput
  ) {
    const user = context.user;
    if (!user) {
      throw new GraphQLError("Unauthorized: User is not authenticated");
    }
    return await this.contactService.updateContact(contactId, input);
  }

  @Authorized()
  @Mutation(() => Contact)
  async deleteContact(@Ctx() context: Context, @Arg("contactId") contactId: string) {
    const user = context.user;
    if (!user) {
      throw new GraphQLError("Unauthorized: User is not authenticated");
    }
    return await this.contactService.deleteContact(contactId);
  }
} 