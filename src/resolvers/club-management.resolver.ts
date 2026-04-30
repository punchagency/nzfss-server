import { Arg, Authorized, Ctx, Mutation, Query, Resolver } from "type-graphql";
import {
  ClubManagement,
  CreateClubManagementInput,
  FindClubManagementByIdInput,
  UpdateClubManagementInput,
} from "../schema/club-management.schema";
import Context from "../types/context";
import { ClubManagementService } from "../service/club-management.service";
import { ApolloError } from "apollo-server";

@Resolver()
export default class ClubManagementResolver {
  constructor(private clubManagementService: ClubManagementService) {
    this.clubManagementService = new ClubManagementService();
  }

  @Authorized()
  @Mutation(() => ClubManagement)
  createClubManagement(
    @Ctx() context: Context,
    @Arg("input") input: CreateClubManagementInput
  ) {
    return this.clubManagementService.createClubManagement(input, context);
  }

  @Query(() => [ClubManagement], { nullable: true })
  async getAllClubManagements(@Ctx() context: Context) {
    const user = context.user!;
    return await this.clubManagementService.getAllClubManagements(user);
  }

  @Authorized()
  @Query(() => ClubManagement, { nullable: true })
  async findClubManagementById(
    @Arg("input") input: FindClubManagementByIdInput,
    @Ctx() context: Context
  ) {
    const user = context.user!;
    return await this.clubManagementService.findClubManagementById(input.clubId, user);
  }

  @Authorized()
  @Mutation(() => ClubManagement)
  async updateClubManagement(
    @Ctx() context: Context,
    @Arg("clubId") clubId: string,
    @Arg("input") input: UpdateClubManagementInput
  ) {
    const user = context.user!;
    return await this.clubManagementService.updateClubManagement(input, clubId, user);
  }

  @Authorized()
  @Mutation(() => ClubManagement)
  async deleteClubManagement(
    @Ctx() context: Context,
    @Arg("clubId") clubId: string
  ) {
    const user = context.user!;
    return await this.clubManagementService.deleteClubManagement(clubId, user);
  }

  @Authorized()
  @Query(() => ClubManagement, { nullable: true })
  async getClubManagement(
    @Arg("userId") userId: string,
    @Ctx() context: Context
  ) {
    const user = context.user!;
    if (user._id !== userId && user.role !== "ADMIN") {
      throw new ApolloError("Unauthorized access");
    }
    return await this.clubManagementService.getAllClubManagements(user);
  }

  @Authorized()
  @Query(() => ClubManagement, { nullable: true })
  async getCurrentUserClubDetails(
    @Ctx() context: Context
  ) {
    const user = context.user!;
    if (!user) {
      throw new ApolloError("User not authenticated");
    }
    
    // Use the existing service method to get club details for the current user
    const clubs = await this.clubManagementService.getAllClubDetails(user);
    
    // Return the first club found for this user, or null if none exists
    return clubs.length > 0 ? clubs[0] : null;
  }
} 