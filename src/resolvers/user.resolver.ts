import { Arg, Authorized, Ctx, Mutation, Query, Resolver } from "type-graphql";
import {
  CreateUserInput,
  FindUserByIdInput,
  LoginInput,
  LoginResponse,
  UpdateUserInput,
  User,
} from "../schema/user.schema";
import UserService from "../service/user.service";
import Context from "../types/context";
import { ApolloError } from "apollo-server";
import { logger } from "../utils/logger";
import bcrypt from 'bcryptjs'

@Resolver()
export default class UserResolver {
  constructor(private userService: UserService) {
    this.userService = new UserService();
  }

  @Mutation(() => User)
  createUser(@Arg("input") input: CreateUserInput) {
    return this.userService.createUser(input);
  }

  @Mutation(() => User)
  createClub(@Arg("input") input: CreateUserInput) {
    return this.userService.createClub(input);
  }

  @Mutation(() => LoginResponse)
  login(@Arg("input") input: LoginInput, @Ctx() context: Context) {
    return this.userService.login(input, context);
  }

  @Mutation(() => Boolean)
  async logout(@Ctx() ctx: Context): Promise<Boolean> {
    // Clear cookies with multiple strategies to ensure removal in all environments
    const cookieNames = ["accessToken", "authToken", "userRole"];    
    const baseOptions = {
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? ("none" as const) : ("lax" as const),
    };

    // Default clear
    cookieNames.forEach((name) => ctx.res.clearCookie(name));

    // Clear with explicit options
    cookieNames.forEach((name) => ctx.res.clearCookie(name, baseOptions));
    
    // Extra: overwrite cookies with immediate expiry as a fallback
    cookieNames.forEach((name) => {
      ctx.res.cookie(name, "", { ...baseOptions, maxAge: 0 });
    });

    // Set a short-lived logout flag so subsequent requests ignore cookie auth
    ctx.res.cookie('logout', '1', { 
      ...baseOptions, 
      httpOnly: false, 
      maxAge: 5 * 60 * 1000 
    });
    return true;
  }

  @Query(() => User, { nullable: true })
  async getCurrentUser(@Ctx() context: Context) {
    try {
      return context.user;
    } catch (error) {
      logger.error(`Error in getCurrentUser: ${error}`);
      throw new ApolloError("Failed to get current user");
    }
  }

  @Query(() => User, { nullable: true })
  currentUser(@Ctx() context: Context) {
    return context.user;
  }

  @Query(() => User, { nullable: true })
  async findUserById(
    @Arg("input") input: FindUserByIdInput,
    @Ctx() context: Context
  ) {
    const currentUser = context.user;
    const serverError = "Internal Server Error";
    try {
      const user = await this.userService.findUserById(input, currentUser);
      return user;
    } catch (error) {
      logger.error(`${error}`);
      return new ApolloError(serverError);
    }
  }

  @Query(() => User, { nullable: true })
  async findClubById(
    @Arg("input") input: FindUserByIdInput,
    @Ctx() context: Context
  ) {
    const currentUser = context.user;
    try {
      const club = await this.userService.findClubById(input, currentUser);
      return club;
    } catch (error) {
      logger.error(`${error}`);
      throw new ApolloError(error as string);
    }
  }

  @Query(() => [User], { nullable: true })
  async getAllUsers(@Ctx() context: Context) {
    try {
      const user = context.user;
      return await this.userService.getAllUsers(user);
    } catch (error) {
      logger.error('Error in getAllUsers resolver:', error);
      if (error instanceof ApolloError) {
        throw error;
      }
      throw new ApolloError('Failed to fetch users');
    }
  }

  @Query(() => [User], { nullable: true })
  async getAllClubs(@Ctx() context: Context) {
    try {
      console.log("User resolver: getAllClubs called - public access");
      const clubs = await this.userService.getAllClubs(context.user);
      console.log(`User resolver: returning ${clubs.length} clubs`);
      return clubs;
    } catch (error) {
      console.error("User resolver: Error in getAllClubs:", error);
      logger.error(`Error in getAllClubs: ${error instanceof Error ? error.stack : JSON.stringify(error)}`);
      
      throw new ApolloError(
        "Failed to fetch clubs", 
        "CLUBS_FETCH_ERROR",
        { originalError: error instanceof Error ? error.message : String(error) }
      );
    }
  }

  @Authorized()
  @Mutation(() => User)
  async updateUserProfile(
    @Ctx() context: Context,
    @Arg("input") input: UpdateUserInput
  ) {
    try {
      let data = { ...input };
      const user = context.user!;
      return await this.userService.updateUserProfile(
        {
          ...data,
          user: user?._id,
        },
        user
      );
    } catch (error) {
      logger.error(error);
      throw new ApolloError("An Unexpected Error Occured");
    }
  }
  @Authorized()
  @Mutation(() => User)
  async updateClub(
    @Ctx() context: Context,
    @Arg("input") input: UpdateUserInput,
    @Arg("clubId") clubId: String,
  ) {
    try {
      const user = context.user!;
      return await this.userService.updateClub(input, user, clubId);
    } catch (error) {
      logger.error(error instanceof Error ? error.message : error);

      if (error instanceof ApolloError) {
        throw error;
      }

      throw new ApolloError("Internal sever error ");
    }
  }

  @Authorized()
  @Mutation(() => User)
  async deleteUser(@Arg("userId") userId: String, @Ctx() context: Context,){
    const serverError = "Internal Server Error";
    const user = context.user!
    try {
      return await this.userService.deleteUser(userId, user);
      
    } catch (error) {
      logger.error(error instanceof Error ? error.message : error);

      if (error instanceof ApolloError) {
        throw error;
      }

      throw new ApolloError("Internal sever error ");
    }
  }

  @Authorized()
  @Mutation(() => User)
  async deleteClub(@Arg("clubId") clubId: String, @Ctx() context: Context,){
    const serverError = "Internal Server Error";
    const user = context.user!
    try {
      return await this.userService.deleteClub(clubId, user);
    } catch (error) {
      logger.error(error instanceof Error ? error.message : error);

      if (error instanceof ApolloError) {
        throw error;
      }

      throw new ApolloError("Internal sever error ");
    }
  }
}
