import { Query, Resolver } from "type-graphql";
import { ApolloError } from "apollo-server";
import { DogRacePointSummary } from "../schema/dog-race-points.schema";
import { computeDogRacePointSummaries } from "../service/dog-race-points.service";

@Resolver()
export class DogRacePointsResolver {
  @Query(() => [DogRacePointSummary])
  async getDogRacePointSummaries(): Promise<DogRacePointSummary[]> {
    try {
      return await computeDogRacePointSummaries();
    } catch (error) {
      console.error("Error computing dog race point summaries:", error);
      throw new ApolloError(
        `Failed to compute dog race points: ${(error as Error).message}`
      );
    }
  }
}
