import { Arg, Authorized, Ctx, Mutation, Query, Resolver } from "type-graphql";
import Context from "../types/context";
import { ApolloError } from "apollo-server";
import UserService from "../service/user.service";
import { CreateEntrantInput, Entrants, FindEntrantByIdInput, UpdateEntrantInput } from "../schema/entrants.schema";
import { EntrantService } from "../service/entrant.service";
import { LogService } from "../service/log.service";

@Resolver()
export default class EntrantResolver {
  
  constructor(private entrantService: EntrantService, private logService: LogService) {
    this.entrantService = new EntrantService(this.logService);
  }

  @Authorized()
  @Mutation(() => Entrants)
  createEntrant(@Ctx() context: Context, @Arg("input") input: CreateEntrantInput) {
    const userId = context.user?._id
    return this.entrantService.createEntrant(input, userId);
  }

  @Query(() => [Entrants], { nullable: true })
  async getAllEntrants(@Ctx() context: Context) {
    const user = context.user;
    return await this.entrantService.getAllEntrants(user);
  }

  @Authorized()
  @Query(()=> Entrants, {nullable: true})
  async findSingleEntrantById(
    @Arg("input") input : FindEntrantByIdInput,
    @Ctx() context: Context
  ){
    const user = context.user!;
    if(!user) (
        new ApolloError("User must be authenticated")
    )
    const Entrant = await this.entrantService.findEntrantById(input);

    return Entrant;
  }

  @Authorized()
  @Query(() => [Entrants], { nullable: true })
  async getEntrantsByEventId(
    @Arg("eventId") eventId: string,
    @Ctx() context: Context
  ) {
    const user = context.user!;
    if(!user) (
        new ApolloError("User must be authenticated")
    )
    return await this.entrantService.findEntrantsByEventId(eventId);
  }

  @Authorized()
  @Mutation(()=> Entrants)
  async updateEntrantDetails(
    @Ctx() context: Context,
    @Arg("input") input: UpdateEntrantInput,
    @Arg("entrantId") entrantId: string
  ){
    const user = context.user;
    if (!user) {
          throw new ApolloError("Unauthorized: User is not authenticated");
        }
        return await this.entrantService.updateEntrant(input, entrantId, user._id);
  }

  @Authorized()
  @Mutation(() => Entrants)
  async deleteEntrant(@Ctx() context: Context, @Arg("entrantId") entrantId: string) {
    const user = context.user;
    if (!user) {
      throw new ApolloError("Unauthorized: User is not authenticated");
    }

    return await this.entrantService.deleteEntrant(entrantId);
  }
}
