import { Resolver, Query, Mutation, Arg, Authorized, Ctx } from "type-graphql";
import { ApolloError } from "apollo-server";
import {
  UnrecognisedTitleChange,
  RecogniseTitleChangesInput,
  RecogniseTitleChangesResponse,
} from "../schema/dog-title.schema";
import {
  getUnrecognisedTitleChanges,
  recogniseTitleChanges,
} from "../service/dog-title.service";
import { LogService } from "../service/log.service";
import { logger } from "../utils/logger";
import Context from "../types/context";

@Resolver()
export class DogTitleResolver {
  private logService = new LogService();

  /** Background task: dogs whose highest earned title has not been recognised. */
  @Authorized()
  @Query(() => [UnrecognisedTitleChange])
  async getUnrecognisedTitleChanges(): Promise<UnrecognisedTitleChange[]> {
    try {
      return await getUnrecognisedTitleChanges();
    } catch (error) {
      console.error("Error computing unrecognised title changes:", error);
      throw new ApolloError(
        `Failed to compute title changes: ${(error as Error).message}`
      );
    }
  }

  /** Marks the highest earned title as recognised for the given dogs. */
  @Authorized()
  @Mutation(() => RecogniseTitleChangesResponse)
  async recogniseTitleChanges(
    @Arg("input") input: RecogniseTitleChangesInput,
    @Ctx() context: Context
  ): Promise<RecogniseTitleChangesResponse> {
    try {
      if (!input.dogIds || input.dogIds.length === 0) {
        return {
          success: true,
          recognisedCount: 0,
          message: "No dogs provided.",
        };
      }

      const recognised = await recogniseTitleChanges(input.dogIds);

      if (recognised.length > 0) {
        // Certificates are a registry record: keep who issued what, and when.
        // One entry per dog, since logs are looked up by an exact entityId.
        // A failure to log must not roll back titles already written.
        const written = await Promise.allSettled(
          recognised.map((dog) =>
            this.logService.createLog({
              userId: String(context.user?._id || ""),
              action: "recognise-title",
              entity: "dogTitle",
              entityId: dog.dogId,
              oldData: JSON.stringify({ title: dog.previousTitle }),
              newData: JSON.stringify(dog),
            })
          )
        );

        const failed = written.filter((entry) => entry.status === "rejected").length;
        if (failed > 0) {
          logger.error(
            `Recognised ${recognised.length} title(s) but failed to log ${failed} of them.`
          );
        }
      }

      return {
        success: true,
        recognisedCount: recognised.length,
        message: `Recognised titles for ${recognised.length} dog(s).`,
      };
    } catch (error) {
      console.error("Error recognising title changes:", error);
      throw new ApolloError(
        `Failed to recognise title changes: ${(error as Error).message}`
      );
    }
  }
}
