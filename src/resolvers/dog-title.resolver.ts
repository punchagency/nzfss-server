import { Resolver, Query, Mutation, Arg, Authorized } from "type-graphql";
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

@Resolver()
export class DogTitleResolver {
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
    @Arg("input") input: RecogniseTitleChangesInput
  ): Promise<RecogniseTitleChangesResponse> {
    try {
      if (!input.dogIds || input.dogIds.length === 0) {
        return {
          success: true,
          recognisedCount: 0,
          message: "No dogs provided.",
        };
      }

      const recognisedCount = await recogniseTitleChanges(input.dogIds);
      return {
        success: true,
        recognisedCount,
        message: `Recognised titles for ${recognisedCount} dog(s).`,
      };
    } catch (error) {
      console.error("Error recognising title changes:", error);
      throw new ApolloError(
        `Failed to recognise title changes: ${(error as Error).message}`
      );
    }
  }
}
