import { Arg, Authorized, Ctx, Mutation, Query, Resolver } from "type-graphql";
import {
  Club,
  CreateClubInput,
  FindClubByIdInput,
  UpdateClubInput,
} from "../schema/club.schema";
import Context from "../types/context";
import { ClubService } from "../service/club.service";
import { ApolloError } from "apollo-server";
import UserService from "../service/user.service";

@Resolver()
export default class ClubResolver {
  
  constructor(private clubService: ClubService, private userService: UserService) {
    this.clubService = new ClubService(this.userService);
  }

  @Authorized()
  @Mutation(() => Club)
  createClub(@Ctx() context: Context, @Arg("input") input: CreateClubInput) {
    return this.clubService.createClub(input, context);
  }

  @Query(() => [Club], { nullable: true })
  async getAllClubs(@Ctx() context: Context) {
    const user = context.user!;
    return await this.clubService.getAllClubs(user);
  }

  @Query(()=> Club, {nullable: true})
  async findSingleClubById(
    @Arg("input") input : FindClubByIdInput,
    @Ctx() context: Context
  ){
    const club = await this.clubService.findClubById(input, context.user);
    return club;
  }

  @Authorized()
  @Mutation(()=> Club)
  async updateClubDetails(
    @Ctx() context: Context,
    @Arg("input") input: UpdateClubInput,
    @Arg("clubId") clubId: String
  ){
    const user = context.user;
    if (!user) {
          throw new ApolloError("Unauthorized: User is not authenticated");
        }
        return await this.clubService.updateClub(input, user, clubId);
  }

  @Authorized()
  @Mutation(() => Club)
  async deleteClub(@Ctx() context: Context, @Arg("clubId") clubId: String) {
    const user = context.user;
    if (!user) {
      throw new ApolloError("Unauthorized: User is not authenticated");
    }

    return await this.clubService.deleteClub(user, clubId);
  }
}
