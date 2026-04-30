import { Arg, Authorized, Ctx, Mutation, Query, Resolver } from "type-graphql";
import Context from "../types/context";
import { ApolloError } from "apollo-server";
import { CreateLogInput, FindLogsByIdInput, Log } from "../schema/log.schema";
import { LogService } from "../service/log.service";

@Resolver()
export default class LogsResolver {
  
  constructor(private logService: LogService) {
    this.logService = new LogService();
  }

  @Authorized()
  @Mutation(() => Log)
  createLog(@Ctx() context: Context, @Arg("input") input: CreateLogInput) {
    return this.logService.createLog(input);
  }

  @Authorized()
  @Query(() => [Log], { nullable: true })
  async getAllLogs(@Ctx() context: Context) {
    const user = context.user!;
    if(!user) (
        new ApolloError("User must be authenticated")
    )
    return await this.logService.getAllLogs();
  }

  @Authorized()
  @Query(()=> Log, {nullable: true})
  async findSingleLogsById(
    @Arg("input") input : FindLogsByIdInput,
    @Ctx() context: Context
  ){
    const user = context.user!;
    if(!user) (
        new ApolloError("User must be authenticated")
    )
    const log = await this.logService.findLogById(input);

    return log;
  }

  @Authorized()
  @Query(() => [Log], { nullable: true })
  async findLogsByEntrantId(
    @Arg("entrantId") entrantId: string,
    @Ctx() context: Context
  ) {
    const user = context.user!;
    if (!user) {
      throw new ApolloError("User must be authenticated");
    }
    const logs = await this.logService.findLogsByEntityId(entrantId);
    return logs;
  }

  @Authorized()
  @Mutation(() => Log)
  async deleteLog(@Ctx() context: Context, @Arg("logId") logId: String) {
    const user = context.user;
    if (!user) {
      throw new ApolloError("Unauthorized: User is not authenticated");
    }

    return await this.logService.deleteLog(logId);
  }
}
