import { Arg, Authorized, Ctx, Mutation, Query, Resolver } from "type-graphql";
import Context from "../types/context";
import { ApolloError } from "apollo-server";
import UserService from "../service/user.service";
import { CreateDogInput, Dogs, FindDogsByIdInput, UpdateDogsInput } from "../schema/dog.schema";
import { DogsService } from "../service/dogs.service";

@Resolver()
export default class DogsResolver {
  
  constructor(private dogsService: DogsService, private userService: UserService) {
    this.dogsService = new DogsService(this.userService);
  }

  @Authorized()
  @Mutation(() => Dogs)
  createDog(@Ctx() context: Context, @Arg("input") input: CreateDogInput) {
    const userId = context.user?._id
    return this.dogsService.createDogs(input, userId);
  }

  @Authorized()
  @Query(() => [Dogs], { nullable: true })
  async getAllDogs(@Ctx() context: Context) {
    const user = context.user!;
    if(!user) (
        new ApolloError("User must be authenticated")
    )
    return await this.dogsService.getAllDogs();
  }

  @Authorized()
  @Query(()=> Dogs, {nullable: true})
  async findSingleDogsById(
    @Arg("input") input : FindDogsByIdInput,
    @Ctx() context: Context
  ){
    const user = context.user!;
    if(!user) (
        new ApolloError("User must be authenticated")
    )
    const Dogs = await this.dogsService.findDogsById(input);

    return Dogs;
  }

  @Authorized()
  @Mutation(()=> Dogs)
  async updateDogsDetails(
    @Ctx() context: Context,
    @Arg("input") input: UpdateDogsInput,
    @Arg("dogId") dogId: String
  ){
    const user = context.user;
    if (!user) {
          throw new ApolloError("Unauthorized: User is not authenticated");
        }
        return await this.dogsService.updateDogs(input, dogId);
  }

  @Authorized()
  @Mutation(() => Dogs)
  async deleteDog(@Ctx() context: Context, @Arg("dogId") dogId: String) {
    const user = context.user;
    if (!user) {
      throw new ApolloError("Unauthorized: User is not authenticated");
    }

    return await this.dogsService.deleteDogs(dogId);
  } 
}
